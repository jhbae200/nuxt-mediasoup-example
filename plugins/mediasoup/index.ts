import {Context} from '@nuxt/types';
import {Inject} from '@nuxt/types/app';
import Mediasoup from './Mediasoup';

let index: Mediasoup | null = null;
const mediasoupPlugin = ({store, $nuxtSocket}: Context, inject: Inject) => {
    if (!index) {
        index = new Mediasoup(store, $nuxtSocket);
    }
    inject('mediasoup', index);
};
export default mediasoupPlugin;

