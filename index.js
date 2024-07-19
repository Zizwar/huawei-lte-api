const axios = require('axios');
const xml2js = require('xml2js');
const crypto = require('crypto');

class HuaweiLTEAPI {
  constructor(modemIP = '192.168.8.1', username = 'admin', password = 'admin') {
    this.baseURL = `http://${modemIP}/api`;
    this.username = username;
    this.password = password;
    this.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    this.sessionInfo = null;
  }

  async login() {
    try {
      const tokenResponse = await axios.get(`${this.baseURL}/webserver/SesTokInfo`);
      const tokenResult = await xml2js.parseStringPromise(tokenResponse.data);
      const token = tokenResult.response.TokInfo[0];
      
      const passwordHash = crypto.createHash('sha256').update(this.password).digest('hex');
      const loginData = `<?xml version="1.0" encoding="UTF-8"?><request><Username>${this.username}</Username><Password>${passwordHash}</Password></request>`;
      
      const loginResponse = await axios.post(`${this.baseURL}/user/login`, loginData, {
        headers: {
          ...this.headers,
          '__RequestVerificationToken': token
        }
      });
      
      const loginResult = await xml2js.parseStringPromise(loginResponse.data);
      if (loginResult.response.result[0] === 'OK') {
        this.sessionInfo = {
          token: loginResponse.headers['__requestverificationtokenone'],
          sessionId: loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1]
        };
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error.message);
      return false;
    }
  }

  async sendRequest(endpoint, method = 'GET', data = null) {
    if (!this.sessionInfo) {
      const loginSuccess = await this.login();
      if (!loginSuccess) {
        throw new Error('Login failed');
      }
    }

    const headers = {
      ...this.headers,
      '__RequestVerificationToken': this.sessionInfo.token,
      'Cookie': `SessionID=${this.sessionInfo.sessionId}`
    };

    try {
      const response = await axios({
        method,
        url: `${this.baseURL}/${endpoint}`,
        headers,
        data
      });
      return await xml2js.parseStringPromise(response.data);
    } catch (error) {
      console.error('Request error:', error.message);
      throw error;
    }
  }

  async readSMS() {
    return await this.sendRequest('sms/sms-list');
  }

  async sendSMS(phoneNumber, message) {
    const data = `
      <request>
        <Index>-1</Index>
        <Phones><Phone>${phoneNumber}</Phone></Phones>
        <Sca></Sca>
        <Content>${message}</Content>
        <Length>${message.length}</Length>
        <Reserved>1</Reserved>
        <Date>${new Date().toISOString()}</Date>
      </request>
    `;
    return await this.sendRequest('sms/send-sms', 'POST', data);
  }

  async deleteSMS(index) {
    const data = `<request><Index>${index}</Index></request>`;
    return await this.sendRequest('sms/delete-sms', 'POST', data);
  }

  async getDeviceInformation() {
    return await this.sendRequest('device/information');
  }

  async getConnectionStatus() {
    return await this.sendRequest('monitoring/status');
  }

  async getTrafficStatistics() {
    return await this.sendRequest('monitoring/traffic-statistics');
  }

  async getSignalStrength() {
    return await this.sendRequest('device/signal');
  }

  async getDDNSSettings() {
    return await this.sendRequest('ddns/settings');
  }

  async logout() {
    try {
      await this.sendRequest('user/logout', 'POST');
      this.sessionInfo = null;
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      return false;
    }
  }
}

module.exports = HuaweiLTEAPI;

// For ES6 module support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HuaweiLTEAPI;
} else {
  global.HuaweiLTEAPI = HuaweiLTEAPI;
}