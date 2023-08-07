import axios from "axios";
import {getConfig} from "./serverApi";

export async function get(url, params = {}) {
  const result = await axios.get(url, {
    params: params,
    ...await getConfig()
  })

  if (result.data.code === 1000) {
    return result.data.data
  } else {
    return null
  }
}


export async function post(url, data, options = {crud: false}) {
  let conf = await getConfig()
  if (options.crud) {
    conf.headers['Content-Type'] = 'application/json'
  }
  let result
  if(options.crud){
     result = await axios.post(url, JSON.stringify(data), conf
    )
  }else{
     result = await axios.post(url, {
        ...data
      }, conf
    )
  }
  if (result.data.code === 1000) {
    return result.data.data
  } else {
    return null
  }
}
