<router>
  {
    path: '/:l1/:l2/radicals',
    meta: {
      title: 'Radicals | Zero to Hero',
      metaTags: [
        {
          name: 'description',
          content:
            'Chinese character radicals.'
        }
      ]
    }
  }
</router>
<template>
  <div class="main pt-4 mb-4">
    <SocialHead
      :title="`Chinese Radicals | Chinese Zero to Hero`"
      :description="`The most common Chinese radicals, and characters that use them.`"
      :image="`/img/placeholder.jpg`"
    />
    <div class="container">
      <div class="row">
        <div class="col-sm-12">
          <div>
            <h2 class="text-center mb-4">Chinese Radicals</h2>
            <p class="text-center mb-4">This will take a minute to load...</p>
            <div class="mb-4">
              <b-form-checkbox id="hskOnly" v-model="hskOnly" name="hskOnly">
                HSK Characters Only
              </b-form-checkbox>
            </div>
            <Loader class="mt-5" />
            <table
              :class="{
                table: true,
                'radical-table': true,
                'hsk-only': hskOnly,
              }"
            >
              <thead>
                <tr>
                  <th>Radical</th>
                  <th>Characters</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(radical, index) in radicals.slice(0, numRowsVisible)"
                  :key="`radical-${radical.radical}`"
                  v-observe-visibility="
                    index === numRowsVisible - 1 ? visibilityChanged : false
                  "
                >
                  <td><Annotate><span>{{ radical.radical }}</span></Annotate></td>
                  <td>
                    <Annotate
                      v-for="character in radical.characters"
                      :key="`radical-character-${radical.radical}-${character.character}`"
                      :data-level="character.hsk"
                      tag="span"
                    >
                      <span>{{ character.character }}</span>
                    </Annotate>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Helper from "@/lib/helper";

export default {
  async mounted() {
    let radicals = "口 扌 氵 木 亻 一 讠 土 日 辶 艹 ⺼ 纟 心 忄 女 宀 贝 阝 又 钅 十 火 目 刂 禾 力 广 大 人 丷 足 ⺮ 石 攵 山 亠 丿 页 王 田 巾 丶 车 厂 寸 八 疒 冖 米 工 犭 隹 虫 彳 马 尸 二 羊 冂 冫 饣 欠 彐 厶 丨 立 白 方 子 几 衣 灬 月 门 雨 止 丁 户 戈 乚 酉 者 耳 艮 乂 囗 斤 干 分 儿 小 走 舌 皮 衤 穴 皿 肖 殳 弓 尚 且 夕 匕 夂 牛 手 犬 刀 辛 舟 合 占 古 少 非 令 中 由 包 青 ⺈ 羽 礻 见 良 交 莫 亡 罒 彡 龙 士 共 旦 云 勹 不 卜 昔 里 文 己 毛 糸 示 巴 其 廾 各 半 矢 京 反 甬 兑 圭 予 兄 申 尧 比 正 次 林 佥 卩 疋 生 支 自 尤 丬 夫 辟 勿 才 加 可 仓 歹 元 乍 也 九 乙 鸟 高 余 付 只 凶 扁 寺 牙 直 用 水 每 兼 未 免 旁 斗 辰 鬼 并 寿 畐 谷 亥 台 从 韦 曷 亦 去 千 巳 凵 甘 咅 言 主 今 亅 麻 风 川 革 戋 尺 身 兆 勾 龶 角 行 虍 采 召 胡 监 秀 真 勺 登 句 爫 执 喿 气 卓 果 及 斩 是 氏 巨 音 俞 相 ⺌ 长 弟 开 幺 宗 乃 多 玉 因 卑 周 凡 豆 区 至 争 军 取 光 尃 介 此 了 丘 亚 两 业 廿 上 七 黑 鱼 难 失 夋 禺 井 卬 甫 易 贵 炎 西 夆 匋 平 育 而 耂 丑 录 吉 逢 具 垂 叟 曰 甚 柬 齐 氺 母 奇 乔 某 束 末 有 暴 央 既 娄 臽 折 曼 咸 聿 匚 尢 豕 害 丰 夹 成 夬 昌 告 同 乞 司 丂 叔 发 㔾 单 北 化 办 前 冈 则 出 ⺀ 冬 ⺍ 关 天 公 先 象 列 尔 乏 东 专 下 官 屯 章 呙 弗 卖 吾 斥 仑 义 敬 兀 焦 吕 约 色 亢 舍 臼 肉 责 曹 唐 夭 空 离 覀 兹 卒 丙 卯 留 甲 瓦 瓜 求 苗 片 父 敫 票 舀 骨 㐬 州 永 汤 亏 民 乇 朱 步 奉 匡 本 朝 爰 星 明 昆 早 番 童 䍃 廷 旨 兰 昜 或 戒 我 荒 原 若 息 灰 巩 刍 急 思 必 当 敝 隶 帝 布 师 市 差 居 尊 㠯 安 夸 太 曾 竟 荅 坐 回 襄 属 壴 那 戊 员 丩 参 龹 卷 危 午 匸 劳 奴 另 利 切 奏 与 内 兴 兔 建 更 氐 任 以 代 弋 于 孚 头 乛 串 世 ⺊ 三 丈 万 齿 畀 黄 食 频 厷 完 间 金 野 重 首 罗 狂 连 路 赞 遣 射 迷 吴 式 㐱 卂 觉 要 库 君 壮 血 鬲 枼 虽 虚 虑 疏 著 芒 臭 退 却 孛 庄 能 胃 巿 肯 肃 肀 聚 耒 考 老 雚 缶 戎 累 窄 呈 秋 宛 委 知 盾 益 皇 皆 百 隐 疾 疑 畜 男 匹 侯 爻 爱 爪 然 炭 桼 显 忝 肴 海 活 冗 段 死 武 欣 帛 查 矛 柔 冘 析 杀 朵 术 朋 替 普 並 春 旬 无 新 亲 敕 攴 苟 散 孝 敏 亶 斯 啇 率 罢 般 屋 郑 奄 掌 奂 旱 拉 丸 異 赖 董 尉 ⺗ 感 贯 釆 总 圣 快 刃 征 景 弯 玄 张 延 郎 康 度 府 店 邦 带 希 帀 巷 左 崩 岛 復 屈 尝 酋 对 察 宓 宿 宾 兵 容 家 宣 亘 客 宜 定 宅 它 宁 孙 存 昏 波 妻 如 镸 夜 夏 复 啬 陏 堂 刑 卄 困 恩 索 桑 贲 耑 剌 畏 阿 冏 矣 亨 哥 尼 孔 向 名 右 史 叒 受 双 友 县 泉 卸 臣 南 匀 堇 厉 务 朿 刷 到 击 夌 农 写 冒 册 曲 六 入 克 充 允 畺 敖 崔 诸 亭 故 叚 攸 保 呆 便 你 会 伏 壬 五 买 习 乘 乐 乎 之 为 黍 髟 冋 冎 蚤 歺 猋 彦 厄 匊 遂 迶 夅 契 啚 庶 巛 咠 哉 沓 戉 吂 兟 毌 豸 皃 翏 巫 亍 臧 溥 缊 谒 戍 冡 匍 洛 囷 犾 旲 汒 氾 無 舛 舁 彭 朕 贰 匈 仌 乑 甹 翟 ⺳ 㢆 彖 叕 黾 羔 耤 肋 囱 禸 盍 珀 㝵 匝 詹 坴 圤 夃 癶 嵒 玨 豖 孟 孰 烝 昭 肰 寅 屚 衮 奚 贱 眇 斿 昷 洰 罙 函 闰 刘 豙 刅 氿 龺 旡 㐌 旉 樊 聂 隽 阁 臿 妾 疌 肙 圼 穵 曳 犮 尗 彗 夗 歨 廴 㢟 郭 卅 丄 厓 禹 祭 佰 苋 妟 戌 夷 卉 朔 爵 疐 觜 欶 艾 亼 刁 冝 厃 刖 屮 冉 囟 顷 矦 贞 吏".split(
      " "
    );
    let r = [];
    for (let radical of radicals) {
      let characters = await (await this.$getHanzi()).searchByRadical(radical);
      let hskCharacters = [];
      for (let character of characters) {
        let c = await (await this.$getDictionary()).lookupHSKChar(
          character.character
        );
        let d = c ? Object.assign(c, character) : character;
        if (!d.hsk) d.hsk = "7";
        hskCharacters.push(d);
      }

      r.push({
        radical: radical,
        characters: hskCharacters.sort((a, b) => a.hsk - b.hsk),
      });
    }
    this.radicals = r;
  },
  methods: {
    visibilityChanged(isVisible) {
      if (isVisible) {
        this.numRowsVisible = this.numRowsVisible + 10;
      }
    },
  },
  data() {
    return {
      numRowsVisible: 10,
      hskOnly: true,
      radicals: [],
    };
  },
};
</script>

<style lang="scss">
.radical-table.hsk-only span[data-level="7"] {
  display: none;
}

.radical-table span[data-level="7"] {
  color: #999;
}
</style>