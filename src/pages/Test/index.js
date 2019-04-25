import React, { PureComponent } from 'react';
import { List, Icon, Tag, Table } from 'antd';
import { connect } from 'dva';

import EllipsisTooltip from './EllipsisTooltip ';

const columns = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    render: (text, record) => {
      return (
        <span>
          <a href={record.url}>{text}</a>
        </span>
      );
    },
  },
  {
    title: '作者',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: '关键词',
    dataIndex: 'keywords',
    key: 'keywords',
    render: text => {
      let compnt = '';
      let delimits = [',', '，'];
      for (let delimit of delimits) {
        if (text.indexOf(delimit) != -1) {
          compnt = (
            <span>
              {text.split(delimit).map(tag => (
                <Tag color="blue" key={tag}>
                  {tag}
                </Tag>
              ))}
            </span>
          );
          break;
        }
      }
      return compnt;
    },
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '发布时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    sorter: true,
  },
  {
    title: '内容',
    dataIndex: 'content',
    key: 'content',
    width: 150,
    onCell: () => {
      return {
        style: {
          whiteSpace: 'nowrap',
          maxWidth: 150,
        },
      };
    },
    render: text => <EllipsisTooltip title={text}>{text}</EllipsisTooltip>,
  },
  {
    title: '分享数',
    dataIndex: 'share',
    key: 'share',
    sorter: true,
  },
  {
    title: '评论数',
    dataIndex: 'comment',
    key: 'comment',
    sorter: true,
  },
];

@connect(({ test, loading }) => ({
  test,
  loading: loading.effects['test/queryArticalList'],
}))
class Index extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'test/queryArticalList',
      payload: {
        page: 1,
        pagesize: 10,
      },
    });
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'test/pageChange',
      payload: pagination,
    });

    dispatch({
      type: 'test/queryArticalList',
      payload: {
        page: pagination.current,
        pagesize: pagination.pageSize,
        sortField: sorter.field,
        sortOrder: sorter.order,
      },
    });
  };

  onRow = (record, rowKey) => {
    return {
      onClick: this.onRowClick.bind(this, record, rowKey),
    };
  };

  onRowClick = (record, rowKey) => {
    //点击行
    console.log(record.title);
    const { dispatch } = this.props;
    dispatch({
      type: 'test/queryArticalDetail',
      payload: record.id,
    });
  };

  render() {
    const { test = {} } = this.props;
    const { dataSource = [], pagination } = test;
    pagination.showTotal = total => {
      return `Total ${total} items`;
    };
    return (
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={this.handleTableChange}
        onRow={this.onRow}
      />
    );
  }
}
export default Index;
