import ApiService from './ApiService'

const baseUrl = 'http://localhost:3002/'

class RatingService extends ApiService {
  getRatingForSong(id) {
    return this.authorizedRequest(baseUrl + `songID/${id}/ratings`).then(response => {
      return response.data
    })
  }

  postRatingForSong(id, rating) {
    return this.authorizedPost(baseUrl + `songID/${id}/ratings`, {rating: rating}).then(response => {
      return response
    })
  }
}

export default new RatingService();