# Global Watchtower

我要设计一个全球安全风险监测平台，这个平台需要包括对，呃，全球的这个战争、呃，政治局势、恐怖袭击、呃，犯罪、枪击、自然灾害、传染病等各个方面的信息进行，呃，监测、分析和报告的生成。那这个平台需要有一些信源，啊，至少我目前想到可以通过三个信息流来进行信息的监测。信源分别来自，啊，啊，应该是四个信息流，啊四个信息流。四个信息流分别包括来自不同的信源，一个是来自于 Twitter 的信源，一个是来自我固定搜索的主流媒体的信源，一个是，呃，来自于权威的知乎清单，啊，以及这个，呃，全球的顶级的学者、专家，啊，可能会包括一部分的这个，呃，投行和咨询公司。呃，最后一个信源呢，呃，是我们自己的，呃，基于开源情报搜索，呃，定制好的信源。我所说的四个信源并不是四个固定的信源，而是四类信源。我前面的表述有误，你要修正一下啊，是四类信源。然后这四类信源呢，呃，我会根据不同的议题来进行组合。比如说我会专门地，呃，关注全球的战争风险，关注全球的恐怖袭击风险，关注全球的，呃，政治动荡风险，关注全球的，呃，骚乱、游行示威的风险，呃，也有可能会关注全球的这个社会治安犯罪的风险，以及，呃，自然灾害的风险、传染病的风险等等。我会根据不同的频道来设计。除了频道以外呢，除了风险类型这种频道以外呢，还有可能出现一种类型，就是对于某一个专题的，呃，进行研究。比如说对于这个当前美国和伊朗的战争冲突的研究，对于俄乌冲突的主题研究，呃，对于这个，呃，利比亚这个国家的主题的研究，呃，对于当前美国可能会对古巴采取什么样的军事行动的这个风险的研究。这一类呢，是一类主题性质的研究。呃，所以我通过这种常规的监测，通过，通过这个不同风险类型的研究，通过不同的这种主题的研究，呃，比较全面地对全球的风险进行监测、分析和这个报告的生成。我给你的附件呢，是一个视觉设计的规范。啊根据前面我所描述的这个需求，呃，根据，呃，我提供给你的设计规范，我们来做一个这个网站。这个网站呢，呃，一方面它可以是给我的员工来使用，另一方面也可以给客户来浏览。至于员工工作的界面和客户使用的界面要做什么样的区分，我们可以先不用纠结，呃，可以先在一个界面上来做，呃，就以，呃，员工使用的界面来做就可以。然后给客户看的界面，我们可以在这个基础上，呃，进行简化，这个是留待后续处理的，先不用处理。呃，至于这几个信息流怎么来提供，嗯，我会单独设计信源，你不用自己来收集信息，呃，只要能确保，呃，有这样——你能知道有这样的信息流能接进来就可以了，回头可以通过不同的 API 接口把这个信息流引进来。啊，那这里面呢，呃，对，针对信息流可以是需要有 AI 自动地对信息流进行分析，呃，我们的分析师也需要能够对它进行分析。这是我目前大概的一个描述，呃，你可以在此基础上，呃，整理对项目需求的理解，和我进行讨论。然后在我同意了之后，啊，咱们可以开始来设计这个网站了。

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b9619bc-369f-443c-aa61-3da80be98273).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
