const consul = require('consul'); // 默认连接的是127.0.0.1:8500
const debug = require('debug')('dev:watch');
const utils = require('./utils');
class Watch {
    /**
     * 建立跟服务器链接
     * @param {*} args
     */
    connect(...args) {
        if (!this.consul) {
            //建立连接
            debug(`与consul server连接中...`);
            this.consul = consul({
                ...args,
                promisify: utils.fromCallback //转化为promise类型
            });
        }
        return this;
    }
    /**
     * 监控需要的服务
     * @param {*} services
     * @param {*} onChanged
     */
    watch(services, onChanged) {
        const consul = this.consul;
        if (services === undefined) {
            throw new Error('service 不能为空')
        }
        if (typeof services === 'string') {
            serviceWatch(services);
        } else if (services instanceof Array) {
            services.forEach(service => {
                serviceWatch(service);
            });
        }
        function serviceWatch(service) {
            const watch = consul.watch({method: consul.catalog.service.nodes, options: {
                    service
                }});
            watch.on('change', data => {
                debug(`监听service有变化，变化的内容为：${JSON.stringify(data)}`);
                onChanged(null, data);
            });
            watch.on('error', error => {
                debug(`监听consul错误,错误的内容为：${error}`);
                onChanged(error, null);
            });
        }
        return this;
    }
}
module.exports = new Watch();