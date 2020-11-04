import ApiService from './ApiService'

const baseUrl = 'http://localhost:3002/'

class RatingService extends ApiService {
  getRatingForSong(id) {
    return this.authorizedRequest(baseUrl + 'songID/' + id + '/ratings').then(response => {
      return response.data
    })
  }

  postRatingForSong(id, rating) {
    return this.authorizedPost(baseUrl + id, {rating: rating}).then(response => {
      return response.data
    })
  }
}

export default new RatingService();