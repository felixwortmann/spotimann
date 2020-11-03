import axios from 'axios'

const baseUrl = 'http://localhost:3001/'

class SongService {
  getAllSongs() {
    return axios.get(baseUrl + 'songs').then(response => {
      return response.data
    })
  }
}

export default new SongService();