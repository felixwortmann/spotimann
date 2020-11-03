import axios from 'axios'
import ApiService from './ApiService'
import Authentication from './Authentication'

const baseUrl = 'http://localhost:3002/'

class RatingService extends ApiService {
  getRatingForSong(id) {
    return this.authorizedRequest(baseUrl + 'songID/' + id + '/ratings').then(response => {
      return response.data
    })
  }

  postRatingForSong(id, rating) {
    return axios.post(baseUrl + id, {
      headers: {
        Authorization: 'Bearer ' + Authentication.getToken()
      },
      data: {rating: rating}
    }).then(response => {
      return response.data
    })
  }
}

export default new RatingService();