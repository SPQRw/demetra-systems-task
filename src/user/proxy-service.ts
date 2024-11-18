import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as HttpsProxyAgent from 'https-proxy-agent';

@Injectable()
export class ProxyService {
  private axiosInstance;

  constructor() {
    const proxy = 'http://jtzhwqur:jnf0t0n2tecg@45.196.48.9:5435';
    const agent = new HttpsProxyAgent(proxy);

    this.axiosInstance = axios.create({
      httpsAgent: agent,
      proxy: false,
    });
  }

  async makeRequest(url: string, method: string = 'GET', data = null) {
    try {
      const response = await this.axiosInstance.request({
        url,
        method,
        data,
      });
      return response.data;
    } catch (error) {
      throw new HttpException('Proxy request failed', HttpStatus.BAD_GATEWAY);
    }
  }
}
