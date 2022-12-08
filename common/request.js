// export const request = (options)=>{
// 	return new Promise((resolve, reject)=>{
// 		uni.request({
// 			url: BASE_URL + options.url,
// 			data: options.data || {},
// 			method:options.method||'GET',
// 			success:(res)=>{
// 				console.log(res.data);
// 				resolve(res)
// 			},
// 			fail:(err)=>{
// 				uni.showToast({
// 					title:'请求接口失败'
// 				})
// 				reject(err)
// 			}
// 		})
// 	})	
// }

// const res = await this.$request({
// 	url:this.$host + 'account/agent_login',
// 	data: {
// 		'appId':'weixin',
// 		'appSecret':'grSDG234'
// 	}
// })

export const request = {
	'appToken':'',
	'appId':'weixin',
	'appSecret':'grSDG234',
	'apiHost':'http://0.0.0.0:7000/api/',
	getAppToken() {
		return new Promise((resolve, reject)=>{
			uni.request({
				url: this.apiHost + 'account/agent_login',
				data: {
					'appId':'weixin',
					'appSecret':'grSDG234'
				},
				method:'POST',
				success:(res)=>{
					if (res.statusCode && res.statusCode != 200) {//api错误
						uni.showModal({
							content:"" + res.errMsg
						});
						return;
					}
					if (res.data.code) {//返回结果码code判断:0成功,1错误,-1未登录(未绑定/失效/被解绑)
						if (res.data.code != "200") {
							uni.showModal({
								showCancel:false,
								content:"" + res.data.msg
							});
							return;
						}
						this.appToken = res.data.data
					}
					resolve(res)
				},
				fail:(err)=>{
					uni.showToast({
						title:'请求接口失败'
					})
					reject(err)
				}
			})
		});
	},
	async send(options) {
		let self = this;
		if(this.appToken == ''){
			await this.getAppToken();
		} 
		return self.request(options);
	},
	request(options) {
		return new Promise((resolve, reject)=>{
			options.data.username = getApp().globalData.user_tmp_name
			uni.request({
				url: this.apiHost + options.url,
				data: options.data || {},
				method:options.method||'GET',
				header: {
					'AgentAuthorization': 'Bearer '+this.appToken //自定义请求头信息
				},
				success:(res)=>{
					resolve(res)
				},
				fail:(err)=>{
					uni.showToast({
						title:'请求接口失败'
					})
					reject(err)
				}
			})
		})
	}	
}