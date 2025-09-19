#!/usr/bin/env node

import { Command } from 'commander';
import { loadConfig } from './core/config.js';
import { TaskScheduler } from './core/scheduler.js';
import { LoginTask } from './tasks/loginTask.js';
import { initHttpClient } from './core/http.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { mainLogger } from './core/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const program = new Command();

program
  .name('biliTools')
  .description('哔哩哔哩(bilibili)自动化工具')

// 主命令：执行每日任务
program
  .command('run')
  .description('执行每日任务')
  .option('-c, --config <path>', '指定配置文件路径', './config/config.json5')
  .option('-v, --verbose', '显示详细日志')
  .option('--dry-run', '试运行模式，不执行实际操作')
  .action(async (options) => {
    try {
      // 加载配置
      const config = await loadConfig(options.config);
      
      // 初始化HTTP客户端
      initHttpClient(config);
      
      // 创建任务调度器
      const scheduler = new TaskScheduler();
      
      // 检查是否可以执行任务
      if (!scheduler.canExecuteTasks()) {
        process.exit(1);
      }
      
      if (options.dryRun) {
        mainLogger.info('试运行模式，不执行实际操作');
        process.exit(0);
      }
      
      // 执行任务
      const result = await scheduler.executeDailyTasks();

      process.exit(result.success ? 0 : 1);
    } catch (error) {
      mainLogger.error('执行失败:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// 登录检查命令
program
  .command('login')
  .description('检查登录状态')
  .option('-c, --config <path>', '指定配置文件路径', './config/config.json5')
  .action(async (options) => {
    try {
      // 加载配置
      const config = await loadConfig(options.config);
      
      // 初始化HTTP客户端
      initHttpClient(config);
      
      // 执行登录检查
      const loginTask = new LoginTask();
      const result = await loginTask.execute();
      
      if (result.success) {
        const userInfo = loginTask.getUserInfo();
        mainLogger.info('登录状态: 已登录');
        mainLogger.info(`用户名: ${userInfo?.username}`);
        mainLogger.info(`等级: ${userInfo?.level}`);
        mainLogger.info(`硬币: ${userInfo?.coins}`);
        mainLogger.info(`VIP状态: ${userInfo?.vipStatus === 1 ? '是' : '否'}`);
      } else {
        mainLogger.info('登录状态: 未登录');
        mainLogger.info('错误信息:', result.message);
      }
      
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      mainLogger.error('检查登录状态失败:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// 配置初始化命令
program
  .command('init')
  .description('初始化配置文件')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .action(async (options) => {
    try {
      const configDir = './config';
      const configPath = path.join(configDir, 'config.json5');
      const examplePath = path.join(configDir, 'config.example.json5');
      
      // 检查配置文件是否已存在
      if (fs.existsSync(configPath) && !options.force) {
        mainLogger.info('配置文件已存在，使用 --force 参数强制覆盖');
        process.exit(1);
      }
      
      // 创建配置目录
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }
      
      // 复制示例配置文件
      if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, configPath);
        mainLogger.info(`配置文件已创建: ${configPath}`);
        mainLogger.info('请编辑配置文件，填入您的Cookie等信息');
      } else {
        mainLogger.info('示例配置文件不存在，请手动创建配置文件');
        process.exit(1);
      }
    } catch (error) {
      mainLogger.error('初始化配置文件失败:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// 帮助信息
program
  .command('help')
  .description('显示帮助信息')
  .action(() => {
    mainLogger.info('biliTools - 哔哩哔哩自动化工具');
    mainLogger.info('使用方法:');
    mainLogger.info('  biliTools run              执行每日任务');
    mainLogger.info('  biliTools login             检查登录状态');
    mainLogger.info('  biliTools init              初始化配置文件');
    mainLogger.info('  biliTools --help            显示所有命令帮助');
    mainLogger.info('配置文件:');
    mainLogger.info('  默认配置文件路径: ./config/config.json5');
    mainLogger.info('  使用 -c 参数指定自定义配置文件路径');
    mainLogger.info('示例:');
    mainLogger.info('  biliTools init              # 初始化配置文件');
    mainLogger.info('  biliTools login             # 检查登录状态');
    mainLogger.info('  biliTools run               # 执行每日任务');
    mainLogger.info('  biliTools run --dry-run     # 试运行模式');
    mainLogger.info('  biliTools run -c ./my-config.json5  # 使用自定义配置');
  });

// 解析命令行参数
program.parse();

// 如果没有提供任何命令，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}