<script>
	export default {
		globalData: {  
            user_tmp_name: ''  
        }, 
		onLaunch: function() {
			// this.$request.getAppToken();
			console.log('onLaunch')
			let user_tmp_name = uni.getStorageSync('user_tmp_name');
			if (!user_tmp_name) {
				user_tmp_name = Date.now(); 
				uni.setStorageSync('user_tmp_name',user_tmp_name);
			}
			this.globalData.user_tmp_name = user_tmp_name.toString();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},

	}
	
</script>

<style>
	/*每个页面公共css */
</style>
