#!/usr/bin/env node
'use strict';
const commander = require('commander')
const inquirer = require( 'inquirer' )
const create = require('../src/create')
const consoler = require( '../utils/consoler' )

const { green, yellow, blue } = consoler

const question = [
    {
         name:'conf',              /* key */
         type:'confirm',           /* 确认 */
         message:'是否创建新的项目？' /* 提示 */
     },{
         name:'name',
         message:'请输入项目名称？',
         when: res => Boolean(res.conf) /* 是否进行 */
     },{
         name:'author',
         message:'请输入作者？',
         when: res => Boolean(res.conf)
     },{
         type: 'list',            /* 选择框 */
         message: '请选择公共管理状态？',
         name: 'state',
         choices: ['mobx','redux'], /* 选项*/
         filter: function(val) {    /* 过滤 */
           return val.toLowerCase()
         },
         when: res => Boolean(res.conf)
     }
] 

// version版本
commander.version('1.0.0')

/* mycli create 创建项目 */
commander
    .command('create') //自定义指令
    .description('create a project ')
    .action(function(){
        green('👽 👽 👽 '+'欢迎使用Textin_cli,轻松构建React+TS项目～🎉🎉🎉')
        /* 和开发者交互，获取开发项目信息 */
        inquirer.prompt(question).then(answer=>{
            if(answer.conf){
                /* 创建文件 */
                create(answer)
             }
        })
    })

/* mycli start 运行项目 */
commander
.command('start')
 .description('start a project')
 .action(function(){
    green('--------运行项目-------')
 })

/* mycli build 打包项目 */
commander
.command('build')
.description('build a project')
.action(function(){
    green('--------构建项目-------')
})

commander.parse(process.argv)