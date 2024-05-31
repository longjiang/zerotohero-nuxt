import {
  TEST,
  PYTHON_SERVER,
} from "@/lib/utils";

export const getPrices = async () => {
  const testQuery = TEST ? '?test=true' : '';
  const response = await fetch(`${PYTHON_SERVER}/stripe-prices${testQuery}`);
  if (response.ok) {
    const data = await response.json();
    return data
  } else {
    throw new Error('Failed to fetch prices')
  }
}