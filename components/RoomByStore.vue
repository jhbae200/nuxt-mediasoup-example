<template>
  <div>
    <video :srcObject.prop="srcObject" autoPlay class="video" playsInline></video>
    <div>
      <button v-if="!videoProducer" @click="startCam()">cam</button>
      <button v-if="!!videoProducer" @click="stopCam()">cam off</button>
      <button v-if="!audioProducer" @click="startMic()">audio</button>
      <button v-if="!!audioProducer" @click="stopMic()">audio off</button>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

interface RoomData {
  srcObject: MediaStream | null,
  kind: string
}

export default Vue.extend({
  props: {
    userId: String,
    roomId: String,
  },
  data(): RoomData {
    return {
      srcObject: null,
      kind: 'cam',
    };
  },
  computed: {
    videoProducer(): string | null {
      if (this.$store.state[`$mediasoup/${this.kind}`]) {
        return this.$store.state[`$mediasoup/${this.kind}`].video;
      }
      return null;
    },
    audioProducer(): string | null {
      if (this.$store.state[`$mediasoup/${this.kind}`]) {
        return this.$store.state[`$mediasoup/${this.kind}`].audio;
      }
      return null;
    },
  },
  methods: {
    async startCam() {
      console.debug('Room: startCam');
      await this.$store.dispatch('$mediasoup/produce', {
        kind: this.kind,
        track: this.srcObject!.getVideoTracks()[0],
      });
    },
    async stopCam() {
      console.debug('Room: stopCam');
      await this.$store.dispatch('$mediasoup/producerClose', {
        kind: this.kind,
        producerKind: 'video',
      });
    },
    async startMic() {
      console.debug('Room: startMic');
      await this.$store.dispatch('$mediasoup/produce', {
        kind: this.kind,
        track: this.srcObject!.getAudioTracks()[0],
      });
    },
    async stopMic() {
      console.debug('Room: stopMic');
      await this.$store.dispatch('$mediasoup/producerClose', {
        kind: this.kind,
        producerKind: 'audio',
      });
    },
  },
  async mounted() {
    console.debug('Room: mounted');
    this.srcObject = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    // this.transport = await this.$mediasoup.createSendTrans('cam');
    // this.videoProducer = this.transport!.getProducer('video');
    // this.audioProducer = this.transport!.getProducer('audio');
  },
});
</script>

<style>
.video {
  border: 1px solid black;
  width: 300px;
  height: 300px;
}
</style>
