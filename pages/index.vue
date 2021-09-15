<template>
  <div>
    <room-by-store v-if="isJoined" @roomId="roomId" @userId="userId" />
    <form v-else @submit.prevent="submit">
      <div>
        userId: <input v-model="userId" /> <br />
        roomId: <input v-model="roomId" />
      </div>
      <div>
        <button type="submit">join</button>
      </div>
    </form>
  </div>
</template>

<script>
import RoomByStore from '@/components/RoomByStore';
import Vue from 'vue';

export default Vue.extend({
  components: {RoomByStore},
  data({$route}) {
    return {
      userId: $route.query.userId ? $route.query.userId : '',
      roomId: $route.query.roomId ? $route.query.roomId : '',
      isJoined: false,
    };
  },
  methods: {
    async submit() {
      await this.$axios.$post(`${window.location.origin}/api/rooms`, {
        id: this.roomId,
      });
      await this.$mediasoup.joinRoom(this.userId, this.roomId);
      //vuex call
      /*await this.$store.dispatch('$mediasoup/joinRoom', {
        userId: this.userId,
        roomId: this.roomId,
      });*/
      this.isJoined = true;
    },
  },
  mounted() {
    if (this.userId && this.roomId)
      this.submit();
  },
});
</script>
