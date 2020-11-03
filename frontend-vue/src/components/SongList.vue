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