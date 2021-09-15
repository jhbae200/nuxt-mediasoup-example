import {Producer} from 'mediasoup-client/lib/Producer';
import {NuxtSocket} from 'nuxt-socket-io';
import {Store} from 'vuex';

export default class MediaProducer {
    private producer: Producer;
    private store: Store<any>;
    private socket: NuxtSocket;

    constructor({
                    producer,
                    store,
                    socket,
                }: { producer: Producer, store: Store<any>, socket: NuxtSocket }) {
        this.socket = socket;
        this.store = store;
        this.producer = producer;
        this.producer.observer.on('pause', async () => {
            await this.store.dispatch(
                '$nuxtSocket/emit',
                {
                    socket: this.socket,
                    evt: 'ProducerHandler.pause',
                    msg: {
                        producerKind: producer!.kind,
                        kind: producer.appData.kind,
                    },
                });
        }).on('resume', async () => {
            await this.store.dispatch(
                '$nuxtSocket/emit',
                {
                    socket: this.socket,
                    evt: 'ProducerHandler.resume',
                    msg: {
                        producerKind: producer!.kind,
                        kind: producer.appData.kind,
                    },
                });
        }).on('close', async () => {
            await this.store.dispatch(
                '$nuxtSocket/emit',
                {
                    socket: this.socket,
                    evt: 'ProducerHandler.produceClose',
                    msg: {
                        producerKind: producer!.kind,
                        kind: producer.appData.kind,
                    },
                });
        });
    }

    get id() {
        return this.producer.id;
    }

    async close() {
        this.producer.close();
        await this.store.dispatch(
            `$mediasoup/${this.producer.appData.kind}/closeProducer`,
            {
                producerKind: this.producer.kind,
            },
        );
    }
}
