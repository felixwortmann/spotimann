<template>
  <li class="song-tile" :class="{ expanded: expanded }">
    <div class="top-section" @click="clicked()">
      <div class="note-image">
        <img src="/music.svg" alt="" />
      </div>
      <div class="top-aside">
        <div class="song-details">
          <div>
            <span class="title">
              {{ song.title }}
            </span>
            <span class="album">
              {{ song.album }}
            </span>
          </div>

          <div>
            <span class="artist"> {{ song.artist }}, {{ song.year }} </span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress" :style="{ width: progress * 100 + '%' }"></div>
        </div>
      </div>
    </div>
    <div class="player-section">
      <div class="controls">
        <i class="material-icons">skip_previous</i>
        <i class="material-icons">fast_rewind</i>
        <i class="material-icons">play_arrow</i>
        <i class="material-icons">fast_forward</i>
        <i class="material-icons">skip_next</i>
      </div>
      <div
        class="ratings"
        v-if="this.rating != null"
        @mouseleave="this.previewRate = null"
      >
        <i
          v-for="i in 10"
          class="material-icons star-icon"
          :class="{
            gold: i <= rating && !previewRate,
            grey: !this.previewRate ? i > rating : i > previewRate,
            flame: i <= previewRate,
          }"
          v-bind:key="i"
          @mouseover="this.previewRate = i"
          @click="rate(i)"
        >
          star
        </i>
      </div>
    </div>
  </li>
</template>

<script>
import RatingService from '../service/RatingService'

export default {
  props: {
    song: Object,
    expanded: Boolean,
  },
  data() {
    return {
      rating: null,
      previewRate: null,
      progress: Math.random(),
    };
  },
  methods: {
    clicked() {
      this.$emit("expand");
      // was not expanded before, should check if ratings are loaded
      if (!this.expanded) {
        if (this.rating === null) {
          // load rating from rating-service
          RatingService.getRatingForSong(this.song.id).then(rating => {
            console.log(rating);
          })
          this.rating = Math.round(Math.random() * 10);
        }
        console.log(this.song.title);
      }
    },
    rate(rating) {
      console.log("rate", rating);
    },
  },
};
</script>

<style lang="scss">
.song-tile {
  height: 80px;
  /*border: 1px solid #ccc;*/
  border-radius: 5px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
  &.expanded {
    height: 160px;
  }
}

.top-section {
  display: flex;
  align-items: stretch;
}

.progress-bar {
  height: 3px;
  width: 100%;
  bottom: 0;
  .progress {
    width: 0;
    height: 100%;
    background-color: indigo;
  }
}

.note-image {
  width: 60px;
  height: 60px;
  padding: 10px;
  img {
    width: 100%;
    height: 100%;
  }
  background-color: #f62459;
}

.song-tile:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
}

.title {
  font-size: 1.2em;
  font-weight: 700;
}

.top-aside {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.song-details {
  margin-top: 20px;
  margin-right: 80px;
  span {
    margin: 5px;
  }
}

.controls i {
  font-size: 36px;
}

.ratings {
  display: inline-block;
  i {
    transition: ease color 0.3s;
  }
  .gold {
    color: #f5ab35;
  }
  .grey {
    color: #dadfe1;
  }
  .flame {
    color: #f03434;
  }
}

.star-icon {
  position: relative;
  z-index: 1;
  cursor: pointer;
  &::before {
    content: " ";
    display: block;
    border-radius: 24px;
    width: 24px;
    height: 24px;
    position: absolute;
    z-index: -1;
    transition: all ease 0.3s;
  }
  &:hover::before {
    background-color: #e8e8e8;
  }
}
</style>