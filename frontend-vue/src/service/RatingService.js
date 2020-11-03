import axios from 'axios'
import Authentication from './Authentication'

const baseUrl = 'http://localhost:3002/'

class RatingService {
  getRatingForSong(id) {
    return axios.get(baseUrl + id, {
      headers: {
        Authorization: 'Bearer ' + Authentication.getToken()
      }
    }).then(response => {
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