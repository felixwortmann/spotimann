<template>
  <div>
    <h2>Diese Songs können Sie sich anhören!</h2>
    <ul class="songlist">
      <SongListEntry
        v-for="s in songs"
        :song="s"
        v-bind:key="s.id"
        :expanded="s.id == expandedId"
        @expand="expand(s)"
        :playing="s.id == playingId"
        @togglePlayback="togglePlayback(s)"
        @skip="switchSong($event)"
      ></SongListEntry>
    </ul>
  </div>
</template>

<script>
import SongListEntry from "./SongListEntry";

import SongService from '../service/SongService';

export default {
  components: { SongListEntry },
  data() {
    return {
      songs: [],
      expandedId: null,
      playingId: null
    };
  },
  methods: {
    expand(item) {
      if (this.expandedId == item.id) {
        this.expandedId = null;
      } else {
        this.expandedId = item.id;
      }
    },
    togglePlayback(item) {
      if (this.playingId == item.id) {
        this.playingId = null;
      } else {
        this.playingId = item.id;
      }
    },
    switchSong(by) {
      let current = this.playingId || this.expandedId;
      let next = by + current * 1;
      if (this.songs[next-1] != undefined) {
        this.playingId = next;
        this.expandedId = next;
      }
    }
  },
  created() {
    SongService.getAllSongs().then((songs) => {
      this.songs = songs;
    });
  }
};
</script>

<style>
.songlist {
  list-style: none;
  padding-left: 0;
  max-width: 600px;
  margin: 0 auto;
}
</style>