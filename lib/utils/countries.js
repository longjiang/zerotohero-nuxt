
import countries from '../countries'

export const country = (code) => {
  for (let country of countries) {
    if (country.code === code) {
      return country
    }
  }
}