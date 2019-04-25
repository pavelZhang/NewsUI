/**
 * Created by pengj on 2018-4-12.
 */
/* eslint-disable */
// const Cookies = require('js-cookie');

import { notification } from 'antd';
import { getLocale } from 'umi/locale';

const router = require('umi/router');
const axios = require('axios');
const _ = require('lodash');

axios.defaults.withCredentials = true;

const DEF_AXIOS_OPTS = {
  timeout: 6000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  },
  //headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
};

let DEFAULT_HANDLERS = {
  401: result => {
    window.location.href = result.redirect || '/login';
  },
};

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

function matchCodeMes(response) {
  const errortext = codeMessage[response.status_code] || response.statusText;
  return errortext;
}

function responseHandler(resp) {
  const data = resp.data;
  if (data.status_code === 200 && data.response && data.response.return === 'success') {
    return data;
  }
  // 处理错误信息
  let valid_info;
  if (data.response && data.response.invalid_fields && data.response.invalid_fields.length) {
    const temp = data.response.invalid_fields.map(item => {
      return `${item.field}: ${item.limit_desc}`;
    });
    valid_info = temp.join('\n');
  }
  if (resp.config && resp.config.url && resp.config.url.includes('/ip/update')) {
    // 特殊处理ip规划一览的修改接口，报错信息修改
    valid_info = '';
    let { check } = data.response;
    if (check.unkown_hosts && check.unkown_hosts.length) {
      valid_info += check.unkown_hosts.join('\n') + '\n';
    }
    if (check.empty_param && check.empty_param.length) {
      valid_info += check.empty_param.join('\n') + '\n';
    }
    if (check.ip_confict && check.ip_confict.length) {
      valid_info += check.ip_confict.join('\n') + '\n';
    }
    if (check.unvalid_ip_segment && check.unvalid_ip_segment.length) {
      valid_info += check.unvalid_ip_segment.join('\n');
    }
    if (check.unvalid_ip && check.unvalid_ip.length) {
      valid_info += check.unvalid_ip.join('\n');
    }
  }
  let _title = getLocale() === 'en-US' ? 'Error' : '出错了';
  notification.error({
    message: data.response.message ? `${_title}：${data.response.message}` : _title,
    description: data.status_code == 200 ? (valid_info ? valid_info : '') : matchCodeMes(data),
    style: { whiteSpace: 'pre-wrap' },
  });
  // 若提示信息是please login，则跳到登录页
  if (data.response.message === 'please login') {
    router.push('/user');
  }
  return Promise.reject(data);
}

function requestHandler(config) {
  // const cookie = Cookies.get('csrfToken') || '';
  // if(cookie){
  //   config['headers']['x-csrf-token'] = cookie;
  // }
  // config['headers']['x-csrf-token'] = cookie;
  return config;
}

function responseErrorHandler(error) {
  let message, code;

  if (error.response) {
    const { data, status } = error.response;
    if (data.result) {
      message = data.result.message;
      code = data.result.code;
    }

    if (code === undefined) {
      code = status;
    }

    // let handler = DEFAULT_HANDLERS[status];
    let handler = DEFAULT_HANDLERS[status];

    if (_.isString(handler)) {
      window.location.href = handler;
    }

    if (_.isFunction(handler)) {
      handler(data.result, error.response);
    }

    message = matchCodeMes(error.response);
  }

  if (message === undefined) {
    message = error.message || error;
  }

  if (code === undefined) {
    code = -1;
  }

  notification.error({
    message: `异常 ${code}: ${error.config.url}`,
    description: message,
  });
  // eslint-disable-next-line prefer-promise-reject-errors
  return Promise.reject({ message, code });
}

function createInstance(axiosOptions) {
  const options = _.defaultsDeep(DEF_AXIOS_OPTS, axiosOptions);

  const instance = axios.create(options);

  // 回调请求
  instance.interceptors.response.use(responseHandler, responseErrorHandler.bind(options));

  // 异常请求
  instance.interceptors.request.use(requestHandler);
  //   instance.interceptors.request.use(responseInterceptor);
  return instance;
}

function registHandler(handlerOptions) {
  _.defaultsDeep(DEFAULT_HANDLERS, handlerOptions);
}

const http = createInstance();

export { createInstance, http, registHandler };
