const axios = require('axios')

const FEISHU_WEBHOOK = process.env.FEISHU_WEBHOOK || 'YOUR_WEBHOOK_URL'

class FeishuService {

    buildRainCard(date, data) {
        const top10 = data.slice(0, 10)
        const hasRain = data.filter(item => parseFloat(item.rainfall) > 0)

        let markdownContent = `**📅 日期：${date}**\n\n`

        if (hasRain.length === 0) {
            markdownContent += '☀️ 全国无降雨'
        } else {
            markdownContent += `🌧️ 共 **${hasRain.length}** 个城市有降雨\n\n`
            markdownContent += '| 排名 | 城市 | 降雨量 |\n| --- | --- | --- |\n'

            top10.forEach((item, index) => {
                const rainfall = parseFloat(item.rainfall)
                let medal = ''
                if (index === 0) medal = '🥇'
                else if (index === 1) medal = '🥈'
                else if (index === 2) medal = '🥉'
                else medal = `${index + 1}`

                if (rainfall > 0) {
                    markdownContent += `| ${medal} | ${item.city} | **${item.rainfall}mm** |\n`
                } else {
                    markdownContent += `| ${medal} | ${item.city} | ${item.rainfall}mm |\n`
                }
            })
        }

        return {
            msg_type: 'interactive',
            card: {
                schema: '2.0',
                config: {
                    update_multi: true
                },
                header: {
                    title: {
                        tag: 'plain_text',
                        content: '🌧️ 全国昨日降雨排行'
                    },
                    template: hasRain.length > 0 ? 'blue' : 'yellow'
                },
                body: {
                    direction: 'vertical',
                    padding: '12px 12px 12px 12px',
                    elements: [
                        {
                            tag: 'markdown',
                            content: markdownContent
                        }
                    ]
                }
            }
        }
    }

    buildAlertCard(date, result, failedCities) {
        let markdownContent = `**📅 日期：${date}**\n\n`
        markdownContent += `✅ 成功：**${result.success}** / ${result.total}\n`
        markdownContent += `❌ 失败：**${result.total - result.success}** 个城市\n\n`

        if (failedCities.length > 0) {
            markdownContent += '**失败城市：**\n'
            failedCities.forEach(city => {
                markdownContent += `- ${city.name}：${city.error}\n`
            })
        }

        return {
            msg_type: 'interactive',
            card: {
                schema: '2.0',
                config: {
                    update_multi: true
                },
                header: {
                    title: {
                        tag: 'plain_text',
                        content: '⚠️ 采集告警通知'
                    },
                    template: 'red'
                },
                body: {
                    direction: 'vertical',
                    padding: '12px 12px 12px 12px',
                    elements: [
                        {
                            tag: 'markdown',
                            content: markdownContent
                        }
                    ]
                }
            }
        }
    }

    buildHeartbeatCard(status) {
        let markdownContent = `**⏰ 时间：${status.time}**\n\n`
        markdownContent += `🟢 状态：**${status.status}**\n`
        markdownContent += `📊 昨日采集：**${status.lastCollect}**\n`
        markdownContent += `⏱️ 服务运行：**${status.uptime}**\n`

        return {
            msg_type: 'interactive',
            card: {
                schema: '2.0',
                config: {
                    update_multi: true
                },
                header: {
                    title: {
                        tag: 'plain_text',
                        content: '💓 服务心跳报告'
                    },
                    template: 'green'
                },
                body: {
                    direction: 'vertical',
                    padding: '12px 12px 12px 12px',
                    elements: [
                        {
                            tag: 'markdown',
                            content: markdownContent
                        }
                    ]
                }
            }
        }
    }

    async sendCard(card) {
        try {
            const res = await axios.post(FEISHU_WEBHOOK, card, {
                headers: { 'Content-Type': 'application/json' }
            })

            if (res.data.code === 0) {
                console.log('飞书推送成功')
                return true
            } else {
                console.error('飞书推送失败:', res.data.msg)
                return false
            }
        } catch (err) {
            console.error('飞书推送异常:', err.message)
            return false
        }
    }

    async sendRainReport(date, data) {
        const card = this.buildRainCard(date, data)
        return await this.sendCard(card)
    }

    async sendAlert(date, result, failedCities) {
        const card = this.buildAlertCard(date, result, failedCities)
        return await this.sendCard(card)
    }

    async sendHeartbeat(status) {
        const card = this.buildHeartbeatCard(status)
        return await this.sendCard(card)
    }
}

module.exports = new FeishuService()
