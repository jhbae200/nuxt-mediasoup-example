import Mediasoup from './plugins/mediasoup/Mediasoup';

declare module 'vue/types/vue' {
    interface Vue {
        $mediasoup: Mediasoup;
    }
}
