import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // await app.listen(process.env.PORT ?? 4000);
  await app.listen(process.env.PORT ?? 4000, '0,0,0,0');
}
bootstrap();

/*

NVM vs NPM：NPM 是 Node 的包管理器（管理项目依赖），NVM 是 Node 版本管理器（管理 Node 本身）

下面给出该项目主要文件/文件夹的简短作用说明：

- **`dist/`**: 编译产物目录（TypeScript -> JavaScript）。包含 `main.js`、`app.module.js`、`app.controller.js`、`app.service.js` 及 sourcemap/声明等，部署/运行时用此目录下文件。
- **`src/`**: 源代码（TypeScript）。包含：
  - **`main.ts`**: 应用启动入口（Nest 应用 bootstrap）。
  - **`app.module.ts`**: 根模块，注册控制器/服务/其它模块。
  - **`app.controller.ts`**: 示例控制器，定义路由处理。
  - **`app.service.ts`**: 示例业务逻辑/服务层。
  - **`app.controller.spec.ts`**: 单元测试（针对 `app.controller`）。
- **`test/`**: 端到端测试相关（e2e），如 `app.e2e-spec.ts`，以及 `jest-e2e.json`（e2e 的 Jest 配置）。
- **`package.json`**: 项目元信息、依赖与脚本。关键脚本有 `build`（`nest build`）、`start`、`start:dev`、`start:prod`、`test`、`test:e2e` 等；并声明了 Nest/TypeScript/Jest 等依赖。
- **`package-lock.json` / `node_modules/`**: 依赖锁定与已安装包。
- **`nest-cli.json`**: Nest CLI 配置（如 `sourceRoot: "src"`、构建选项）。
- **`tsconfig.json` / `tsconfig.build.json`**: TypeScript 编译配置（开发与构建配置分别放置）。
- **`eslint.config.mjs`**: ESLint 配置（代码风格/检查规则）。
- **`README.md`**: 项目说明（这是 Nest starter 的默认 README，包含安装/运行/测试 指南）。
- 其它说明：
  - `dist/` 下的 `tsconfig.build.tsbuildinfo` 是构建的增量信息，通常可以忽略或加入到产物清理。
  - `jest` 配置主要在 `package.json` 中（已配置 `ts-jest` 用于 TypeScript 测试）。

*/