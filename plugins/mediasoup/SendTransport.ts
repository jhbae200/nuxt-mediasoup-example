import {MediaKind} from 'mediasoup-client/lib/RtpParameters';
import {Transport} from 'mediasoup-client/lib/Transport';
import {NuxtSocket} from 'nuxt-socket-io';
import {Store} from 'vuex';
import MediaProducer from './MediaProducer';

export default class SendTransport {
    kind: string;
    videoProducer: MediaProducer | null = null;
    audioProducer: MediaProducer | null = null;
    private transport: Transport;
    private store: Store<any>;
    private socket: NuxtSocket;

    constructor({
                    transport,
                    store,
                    socket,
                }: { transport: Transport, store: Store<any>, socket: NuxtSocket }) {
        this.kind = transport.appData.kind;
        this.socket = socket;
        this.store = store;
        this.store.registerModule(
            '$mediasoup/'+this.kind,
            {
                namespaced: true,
                state: () => ({
                    video: null,
                    audio: null,
                } as { video: string | null, audio: string | null }),
                mutations: {
                    producer(state, data: {id: string, producerKind: MediaKind}) {
                        state[data.producerKind] = data.id;
                    }
                },
                actions: {
                    closeProducer: ({commit}, {producerKind}: { producerKind: MediaKind }) => {
                        switch (producerKind) {
                            case 'video':
                                this.videoProducer = null;
                                commit('producer', {
                                    kind: this.kind,
                                    producerKind,
                                    id: null
                                });
                                break;
                            case 'audio':
                                this.audioProducer = null;
                                commit('producer', {
                                    kind: this.kind,
                                    producerKind,
                                    id: null
                                });
                                break;
                            default:
                                throw new Error('producer kind not supported. kind: ' + producerKind);
                        }
                    },
                },
            },
        );
        this.transport = transport;
        this.transport.on('connect', async ({dtlsParameters}, callback, errback) => {
            console.debug('SendTransport: transport connect');
            try {
                const data = await this.store.dispatch(
                    '$nuxtSocket/emit',
                    {
                        socket: this.socket,
                        evt: 'ProducerHandler.connect',
                        msg: {
                            kind: this.kind,
                            dtlsParameters,
                        },
                    },
                );
                callback(data);
            } catch (e) {
                errback(e);
            }
        }).on('error', (err) => {
            console.error(err);
        }).on('produce', async ({kind, rtpParameters, appData}, callback, errback) => {
            console.debug('SendTransport: transport produce');
            try {
                const data = await this.store.dispatch(
                    '$nuxtSocket/emit',
                    {
                        socket: this.socket,
                        evt: 'ProducerHandler.produce',
                        msg: {
                            producerKind: kind,
                            kind: this.kind,
                            rtpParameters,
                            appData,
                        },
                    },
                );
                callback(data);
            } catch (err) {
                errback(err);
            }
        }).observer.on('close', async () => {
            console.debug('SendTransport: transport close');
            await this.store.dispatch(
                '$mediasoup/sendTransClose',
                {
                    kind: this.kind,
                },
            );
        });
    }

    get id() {
        return this.transport.id;
    }

    getProducer(kind: MediaKind) {
        switch (kind) {
            case 'video':
                return this.videoProducer;
            case 'audio':
                return this.audioProducer;
            default:
                throw new Error('producer kind not supported. kind: ' + kind);
        }
    }

    async produce({track}: { track: MediaStreamTrack }): Promise<MediaProducer> {
        switch (track.kind) {
            case 'video':
                if (this.videoProducer) {
                    console.debug('SendTransport: already video producer');
                    return this.videoProducer;
                }
                this.videoProducer = new MediaProducer({
                    producer: await this.transport.produce({
                        track, appData: this.transport.appData,
                    }),
                    store: this.store,
                    socket: this.socket,
                });
                this.store.commit(`$mediasoup/${this.kind}/producer`, {
                    kind: this.kind,
                    producerKind: track.kind,
                    id: this.videoProducer.id,
                });
                return this.videoProducer;
            case 'audio':
                if (this.audioProducer) {
                    console.debug('SendTransport: already audio producer');
                    return this.audioProducer;
                }
                this.audioProducer = new MediaProducer({
                    producer: await this.transport.produce({
                        track, appData: this.transport.appData,
                    }),
                    store: this.store,
                    socket: this.socket,
                });
                this.store.commit(`$mediasoup/${this.kind}/producer`, {
                    kind: this.kind,
                    producerKind: track.kind,
                    id: this.audioProducer.id,
                });
                return this.audioProducer;
            default:
                throw new Error('producer kind not supported. kind: ' + track.kind);
        }
    }
}
