import {Device} from 'mediasoup-client';
import {MediaKind} from 'mediasoup-client/lib/RtpParameters';
import {NuxtSocket, NuxtSocketOpts} from 'nuxt-socket-io';
import {Store} from 'vuex';
import SendTransport from './SendTransport';

export type UserKind = 'cam';

interface SendTransMutations {
    kind: UserKind,
    id: string,
}

export default class Mediasoup {
    $nuxtSocket: (ioOpts: NuxtSocketOpts) => NuxtSocket;
    store: Store<any>;
    device: Device | null = null;
    socket: NuxtSocket | null = null;
    cam: SendTransport | null = null;

    constructor(store: Store<any>, $nuxtSocket: (ioOpts: NuxtSocketOpts) => NuxtSocket) {
        this.$nuxtSocket = $nuxtSocket;
        this.store = store;
        store.registerModule(
            '$mediasoup',
            {
                namespaced: true,
                state: {
                    cam: null,
                } as { cam: string | null },
                mutations: {
                    sendTrans(state, data: SendTransMutations) {
                        console.debug('Mediasoup Mutations: sendTrans');
                        state[data.kind] = data.id;
                    },
                },
                actions: {
                    joinRoom: async (context, {userId, roomId}: { userId: string, roomId: string }) => {
                        return await this.joinRoom(userId, roomId);
                    },
                    produce: async (context, data: { kind: UserKind, track: MediaStreamTrack }) => {
                        return await this.produce(data);
                    },
                    producerClose: async ({commit}, data: { kind: UserKind, producerKind: MediaKind }) => {
                        await this.producerClose(data);
                    },
                },
            },
        );
    }

    async joinRoom(userId: string, roomId: string) {
        if (!this.socket) {
            this.socket = this.$nuxtSocket({
                name: 'mediasoup',
                path: '/ws',
                query: {
                    userId: userId,
                    roomId: roomId,
                },
                transports: ['websocket'],
                rejectUnauthorized: false,
                persist: true,
            });
            return new Promise<void>(resolve => {
                this.socket!.once('connect', () => {
                    return resolve();
                });
            });
        }
    }

    async produce({kind, track}: { kind: UserKind, track: MediaStreamTrack }) {
        const transport = await this.createSendTrans(kind);
        return await transport.produce({track});
    }

    private async loadDevice() {
        if (!this.device) {
            this.device = new Device();
            console.debug('Mediasoup Plugin: device new instance');
        }
        if (this.device && !this.device.loaded) {
            const routerRtpCapabilities = await this.store.dispatch(
                '$nuxtSocket/emit',
                {
                    socket: this.socket,
                    evt: 'getRouterRtpCapabilities',
                },
            );
            await this.device.load({routerRtpCapabilities});
            console.debug('Mediasoup Plugin: device loaded');
        }
    }

    private async createSendTrans(kind: UserKind): Promise<SendTransport> {
        if (!this.device) {
            await this.loadDevice();
        }
        const sendTrans = this.getSendTrans(kind);
        if (sendTrans) {
            console.debug('Mediasoup Plugin: already send transport');
            return sendTrans;
        }
        const options = await this.store.dispatch(
            '$nuxtSocket/emit',
            {
                socket: this.socket,
                evt: 'ProducerHandler.create',
                msg: {
                    forceTcp: false,
                    rtpCapabilities: this.device!.rtpCapabilities,
                    kind: kind,
                },
            },
        );
        this[kind] = new SendTransport({
            transport: this.device!.createSendTransport(options),
            socket: this.socket!,
            store: this.store,
        });
        this.store.commit('$mediasoup/sendTrans', {kind: kind, id: this[kind]!.id});
        return this[kind]!;
    }

    private getSendTrans(kind: UserKind): SendTransport | null {
        return this[kind];
    }

    private getSendProducer({kind, producerKind}: { kind: UserKind, producerKind: MediaKind }) {
        return this.getSendTrans(kind)!.getProducer(producerKind);
    }

    private async producerClose(data: { kind: UserKind; producerKind: MediaKind }) {
        await this.getSendProducer(data)?.close();
    }
}
