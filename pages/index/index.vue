<template>
	<view>
		<view>
			<navigator url="/pages/index/luck?luck_id=1" hover-class="navigator-hover">
				<button type="default">去抽奖</button>
			</navigator>
		</view>
	</view>
</template>

<script>
export default {
    data() {
        return {
            dataList: [],
        }
    },
	created() {
	  this.requestParams = {
	    minId: 0,
	    pageSize: 21,
	    column: 'id,post_id,title,author_name,cover,published_at,comments_count'
	  };
	},
    methods: {
		loadData(refresh) {
			console.log(this.requestParams);
			uni.request({
			  url: this.$host + 'api/news',
			  data: this.requestParams,
			  success: (result) => {
				console.log(result);
			    var endTime = new Date();
			    const data = result.data;
			    this.isNoData = (data.length <= 0);
			
			    const data_list = data.map((news) => {
			      return {
			        newsid: news.id,
			        title: news.title,
			        src: news.cover,
			        source: news.author_name,
			        comment_count: news.comments_count,
			        post_id: news.post_id
			      };
			    });

				if (refresh) {
					this.dataList = data_list;
					this.requestParams.minId = 0;
				} else {
					this.dataList = this.dataList.concat(data_list);
					this.requestParams.minId = data[data.length - 1].id;
				}
			  },
			  fail: (err) => {
			    if (this.dataList.length == 0) {
			      this.isNoData = true;
			    }
			  },
			  complete: (e) => {

			  }
			});
		},
        imageError: function(e) {
            console.error('image发生error事件，携带值为' + e.detail.errMsg)
        }
    },
	onReady() {
		// this.loadData();
	},
	onReachBottom(){
		// this.loadData();
	},
	// onPullDownRefresh(){
	// 	console.log("onPullDownRefresh");
	// 	this.loadData(true);
	// }
}
</script>


<style>

</style>
