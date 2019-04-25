import {
  queryRule,
  removeRule,
  addRule,
  updateRule,
  queryVersion,
  queryArticleList,
  queryArticleDetail,
} from '@/services/api';

export default {
  namespace: 'test',

  state: {
    dataSource: [],
    pagination: {
      current: 1,
      total: 0,
      pageSize: 10,
    },
  },

  effects: {
    *fetch({}, { call, put }) {
      const response = yield call(queryVersion);
      yield put({
        type: 'show',
        payload: response,
      });
    },

    *queryArticalList({ payload }, { call, put }) {
      const response = yield call(queryArticleList, payload);
      yield put({
        type: 'show',
        payload: response,
      });
    },

    *queryArticalDetail({ payload }, { call, put }) {
      const response = yield call(queryArticleDetail, payload);
      yield put({
        type: 'show',
        payload: response,
      });
    },
  },

  reducers: {
    show(state, { payload }) {
      return {
        ...state,
        dataSource: payload['response']['data']['detail'],
        pagination: {
          total: payload['response']['data']['all'],
          current: payload['response']['data']['page'],
        },
      };
    },

    pageChange(state, { payload }) {
      return {
        ...state,
        pagination: payload,
      };
    },
  },
};
