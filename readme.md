# Mediasuop client

- [use vuex](#Usage-Vuex-Send-Example)

# Usage Vuex Send Example

[RoomByStore.vue](components/RoomByStore.vue)

## $mediasoup state

```typescript
// $mediasoup state
{
    cam: string;
} 
```

## $mediasoup/${kind} state

```typescript
// $mediasoup/${kind} state
// kind is 'cam'
{
    video: string;
    audio: string;
}
```

## Start cam video

```typescript
const mediaStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

await this.$store.dispatch('$mediasoup/produce', {
    kind: 'cam',
    track: mediaStream!.getVideoTracks()[0],
});
```

## Start cam audio

```typescript
const mediaStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});

await this.$store.dispatch('$mediasoup/produce', {
    kind: 'cam',
    track: mediaStream!.getAudioTracks()[0],
});
```

## Stop cam video

```typescript
await this.$store.dispatch('$mediasoup/producerClose', {
    kind: this.kind,
    producerKind: 'video',
});
```

## Stop cam audio

```typescript
await this.$store.dispatch('$mediasoup/producerClose', {
    kind: this.kind,
    producerKind: 'audio',
});
```
