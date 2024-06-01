import {
  TEST,
  PYTHON_SERVER,
} from "@/lib/utils";
import axios from 'axios';

export const getPrices = async () => {
  const testQuery = TEST ? '?test=true' : '';
  try {
      const response = await axios.get(`${PYTHON_SERVER}/stripe-prices${testQuery}`);
      return response.data;
  } catch (error) {
      throw new Error('Failed to fetch prices');
  }
}