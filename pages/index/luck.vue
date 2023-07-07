<template>
	<view>
		<almost-lottery
			:lottery-size="lotteryConfig.lotterySize"
			:action-size="lotteryConfig.actionSize"
			:ring-count="2"
			:duration="1"
			:img-circled="true"
			:canvasCached="true"
			:prize-list="prizeList"
			:prize-index="prizeIndex"
			@reset-index="prizeIndex = -1"
			@draw-start="handleDrawStart"
			@draw-end="handleDrawEnd"
			@finish="handleDrawFinish"
			v-if="prizeList.length"
		/>
    <uni-popup ref="inputDialog" type="dialog">
      <uni-popup-dialog ref="phoneInput" type="number" mode="input" title="输入手机号领取奖品" value=""
        placeholder="请输入手机号" @confirm="dialogPhoneConfirm" :before-close="true"></uni-popup-dialog>
    </uni-popup>
	</view>
</template>

<script>
  import AlmostLottery from '@/uni_modules/almost-lottery/components/almost-lottery/almost-lottery.vue'
	import { clearCacheFile, clearStore } from '@/uni_modules/almost-lottery/utils/almost-utils.js'
  export default {
    name: 'Home',
    components: {
      AlmostLottery
    },
    data () {
      return {
        luck_id: 0,
        // 开启调试模式
        isDev: true,
        
        // 以下是转盘配置相关数据
        lotteryConfig: {
          // 抽奖转盘的整体尺寸，单位rpx
          lotterySize: 600,
          // 抽奖按钮的尺寸，单位rpx
          actionSize: 200
        },
        
        // 以下是转盘 UI 配置
        // 转盘外环图，如有需要，请参考替换为自己的设计稿
        // lotteryBg: require('@/static/lottery-bg.png'),
        // 抽奖按钮图
        // actionBg: require('@/static/action-bg.png'),
        
        // 以下是奖品配置数据
        // 奖品数据
        prizeList: [],
				// 奖品是否设有库存
				onStock: true,
        // 中奖下标
        prizeIndex: -1,
        
        // 是否正在抽奖中，避免重复触发
        prizeing: false,
        
        // 以下为中奖概率有关数据
        // 是否由前端控制概率，默认不开启，强烈建议由后端控制
        onFrontend: false,
        // 权重随机数的最大值
        prizeWeightMax: 0,
        // 权重数组
        prizeWeightArr: [],
        
        // 以下为业务需求有关示例数据
        // 金币余额
        goldCoin: 600,
        // 当日免费抽奖次数余额
        freeNum: 3,
        // 每次消耗的金币数
        goldNum: 20,
        // 每天免费抽奖次数
        freeNumDay: 3
      }
    },
    computed: {
      isApple () {
        return uni.getSystemInfoSync().platform === 'ios'
      }
    },
    methods: {
      // 提交中奖手机号
      async dialogPhoneConfirm(value) {
        if(!this.$validator.PhoneNum(value)){
          uni.showToast({
            title: "手机号格式不正确",
          	mask: true,
          	icon: 'none'
          });
          return
        }
        let res = await this.$request.send(
          {
            url:'luck/updateUserPhone',
            method:'POST',
            data:{phone:value}
          } 
        );
        let data = res.data
        if(!data.success) {
					uni.showModal({
						title: data.message,
            showCancel: false,
					})
          return
        }
        this.$refs.inputDialog.close();
        uni.showModal({
          title: "谢谢，你的奖品会快马加鞭",
          showCancel: false,
        })
        console.log(value);
      },
      // 重新生成
      handleInitCanvas () {
				clearCacheFile()
        clearStore()
        
        this.prizeList = []
        this.getPrizeList()
      },
      // 获取奖品列表
      async getPrizeList () {
        uni.showLoading({
          title: '奖品准备中...'
        })
				
        // 等待接口返回的数据进一步处理
        let res = await this.requestApiGetPrizeList()
        console.log('res:',res);
        if(!res.data.success) {
          uni.hideLoading()
					uni.showModal({
						title: res.data.message,
            showCancel: false,
					})
        }
        const data = res.data.data;
        if(!data.success) {
          uni.hideLoading()
					uni.showModal({
						title: data.message,
            showCancel: false,
					})
        }
        this.isNoData = (data.length <= 0);
        const data_list = data.items.map((item) => {
          return {
            prizeId: item.id,
            prizeName: item.title,
            prizeImage: item.img,
            prizeWeight: item.probability,
            prizeStock: 100,
          };
        });
        if (data_list.length) {
          this.prizeList = data_list
          console.log('已获取到奖品列表数据，开始绘制抽奖转盘')
          
          // 计算开始绘制的时间
          if (console.time) {
            console.time('绘制转盘用时')
          }
          
          // 如果开启了前端控制概率
          // 得出权重的最大值并生成权重数组
          if (this.onFrontend) {
            // 生成权重数组并排序取得最大值
            this.prizeWeightArr = this.prizeList.map((item) => item.prizeWeight)
            let prizeWeightArrSort = [...this.prizeWeightArr]
            prizeWeightArrSort.sort((a, b) => b - a)
            
            // 开放自定义权重最大值，没有自定义则取权重数组中的最大值
            this.prizeWeightMax = this.prizeWeightMax > 0 ? this.prizeWeightMax : prizeWeightArrSort[0]
          }
        }
      },
			// 模拟请求 获取奖品列表 接口，
      // 注意这里返回的是一个 Promise
      // 大哥，这里只是模拟，别告诉我你不会对接自己的接口
			requestApiGetPrizeList () {
        // return {
				// 			ok: true,
				// 			data: [
				// 				{ prizeId: 3, prizeName: '5元话费', prizeStock: 1, prizeWeight: 80 },
				// 				{ prizeId: 6, prizeName: '0.2元现金', prizeStock: 8, prizeWeight: 120 },
				// 				{ prizeId: 7, prizeName: '谢谢参与', prizeStock: 100, prizeWeight: 10000 },
				// 				{ prizeId: 8, prizeName: '100金币', prizeStock: 100, prizeWeight: 3000 }
				// 			]
				// 		};
        return this.$request.send(
          {
            url:'luck/get',
            data:this.requestParams
          }
        );
			},
      // 本次抽奖开始
      handleDrawStart () {
        console.log('触发抽奖按钮')
        if (this.prizeing) return
        this.prizeing = true
        
        // 还有免费数次或者剩余金币足够抽一次
        // if (this.freeNum > 0 || this.goldCoin >= this.goldNum) {
        
        //   // 更新免费次数或金币余额
        //   if (this.freeNum > 0) {
        //     this.freeNum--
        //   } else if (this.goldCoin >= this.goldNum) {
        //     this.goldCoin -= this.goldNum
        //   }
          
          this.tryLotteryDraw()
        // } else {
        //   uni.showModal({
        //     title: '金币不足',
        //     content: '是否前往赚取金币？',
        //     success: (res) => {
        //       // 这里需要根据业务需求处理，一般情况下会引导用户前往赚取金币的页面
        //       console.log('金币不足', res)
        //     },
        //     complete: () => {
        //       this.prizeing = false
        //     }
        //   })
        // }
      },
      // 尝试发起抽奖
      tryLotteryDraw () {
        console.log('旋转开始，获取中奖下标......')
        // 判断是否由前端控制概率
        if (this.onFrontend) {
          this.localGetPrizeIndex()
        } else {
          this.remoteGetPrizeIndex()
        }
      },
      // 本地获取中奖下标
      localGetPrizeIndex () {
        console.warn('###当前处于前端控制中奖概率，安全起见，强烈建议由后端控制###')
        // 前端控制概率的情况下，需要拿到最接近随机权重且大于随机权重的值
        // 后端控制概率的情况下，通常会直接返回 prizeId
        if (!this.prizeWeightMax || !this.prizeWeightArr.length) {
        	console.warn('###当前已开启前端控制中奖概率，但是奖品数据列表中的 prizeWeight 参数似乎配置不正确###')
        	return
        }
        console.log('当前权重最大值为 =>', this.prizeWeightMax)
        
        // 注意这里使用了 Math.ceil，如果某个权重的值为 0，则始终无法中奖
        let randomWeight = Math.ceil(Math.random() * this.prizeWeightMax)
        console.log('本次权重随机数 =>', randomWeight)
        
        // 生成大于等于随机权重的数组
        let tempMaxArrs = []
        this.prizeList.forEach((item) => {
          if (item.prizeWeight >= randomWeight) {
            tempMaxArrs.push(item.prizeWeight)
          }
        })
        console.log('tempMaxArrs', tempMaxArrs)
        
        // 如果大于随机权重的数组有值，先对这个数组排序然后取值
        // 反之新建一个临时的包含所有权重的已排序数组，然后取值
        let tempMaxArrsLen = tempMaxArrs.length
        if (tempMaxArrsLen) {
          tempMaxArrs.sort((a, b) => a - b)
          // 取值时，如果存在多个值，分两种情况
          if (tempMaxArrsLen > 1) {
            // 检查是否存在重复的值
            let sameCount = 0
            for (let i = 0; i < tempMaxArrs.length; i++) {
              if (tempMaxArrs[i] === tempMaxArrs[0]) {
                sameCount++
              }
            }
            
            // 值不相等的情况下取最接近的值，也就是第1个值
            if (sameCount === 1) {
              this.prizeIndex = this.prizeWeightArr.indexOf(tempMaxArrs[0])
            } else {
              // 存在值相等时，随机取值，当然这里你可以自己决定是否随机取值
              let sameWeight = tempMaxArrs[0]
              let sameWeightArr = []
              let sameWeightItem = {}
              this.prizeWeightArr.forEach((item, index) => {
                if (item === sameWeight) {
                  sameWeightArr.push({
                    prizeWeight: item,
                    index
                  })
                }
              })
              console.log('sameWeightArr', sameWeightArr)
              sameWeightItem = sameWeightArr[Math.floor(Math.random() * sameWeightArr.length)]
              console.log('sameWeightItem', sameWeightItem)
              this.prizeIndex = sameWeightItem.index
            }
          } else {
            this.prizeIndex = this.prizeWeightArr.indexOf(tempMaxArrs[0])
          }
        }
        
        console.log('本次抽中奖品 =>', this.prizeList[this.prizeIndex].prizeName)
        
        // 如果奖品设有库存
        if (this.onStock) {
          console.log('本次奖品库存 =>', this.prizeList[this.prizeIndex].prizeStock)
        }
      },
      // 远程请求接口获取中奖下标
      // 大哥，这里只是模拟，别告诉我你不会对接自己的接口
      async remoteGetPrizeIndex () {
        let res =  await this.$request.send(
          {
            url:'luck/addDraw',
            method:'POST',
            data:{luck_id:this.luck_id}
          }
        );
        let data = res.data
        if(!data.success) {
          uni.hideLoading()
					uni.showModal({
						title: data.message,
            showCancel: false,
            // mask: true,
            // icon: 'none'
					})
          this.prizeing = false;
          return
        }
        let prizeId = data.data.id
        let list = [...this.prizeList]
        // 拿到后端返回的 prizeId 后，开始循环比对得出那个中奖的数据
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          if (item.prizeId === prizeId) {
            // 中奖下标
            this.prizeIndex = i
            break
          }
        }
        console.log('本次抽中奖品 =>', this.prizeList[this.prizeIndex].prizeName)
        // 如果奖品设有库存
        if (this.onStock) {
          console.log('本次奖品库存 =>', this.prizeList[this.prizeIndex].prizeStock)
        }
      },
      // 本次抽奖结束
      handleDrawEnd () {
        console.log('旋转结束，执行拿到结果后到逻辑')
        
        // 旋转结束后，开始处理拿到结果后的逻辑
        let prizeName = this.prizeList[this.prizeIndex].prizeName
        let tipContent = ''
				
				if (prizeName === '谢谢参与') {
          tipContent = '很遗憾，没有中奖，请再接再厉！'
				} else {
          // 如果奖品设有库存
          if (this.onStock) {
            let prizeStock = this.prizeList[this.prizeIndex].prizeStock
            tipContent = prizeStock ? `恭喜您，获得 ${prizeName}` : `很抱歉，您来晚了，当前奖品 ${prizeName} 已无库存`
          } else {
            tipContent = `恭喜您，获得 ${prizeName} ！`
          }
        }
        
        uni.showModal({
          content: tipContent,
          showCancel: false,
          complete: () => {
            this.prizeing = false
          }
        })
        this.$refs.inputDialog.open()
      },
      // 抽奖转盘绘制完成
      handleDrawFinish (res) {
        console.log('抽奖转盘绘制完成', res)
        
        if (res.ok) {
          // 计算结束绘制的时间
          if (console.timeEnd) {
            console.timeEnd('绘制转盘用时')
          }
        }
				
        let stoTimer = setTimeout(() => {
          stoTimer = null
          
          uni.hideLoading()
          uni.showToast({
            title: res.msg,
          	mask: true,
          	icon: 'none'
          })
        }, 50)
      },
    },
    onLoad (option) {
      this.luck_id = option.luck_id
      this.requestParams = {
        id: this.luck_id,
      };
      this.prizeList = []
      this.getPrizeList()
    },
    onUnload () {
      uni.hideLoading()
    },
    created() {

    },
    onReady() {
      // this.loadData();
    },
  }
</script>

<style>
</style>
