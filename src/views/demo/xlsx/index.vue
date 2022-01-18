<template>
  <div class="xlsx">
    <table ref="tableRef">
      <thead>
        <tr>
          <th v-for="head in tableHeadList" :key="head.prop">{{ head.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="data in tableDataList" :key="data.key">
          <td v-for="itemName in headOrder" :key="itemName + data.key">{{ data[itemName] }}</td>
        </tr>
      </tbody>
    </table>
    <p class="table_to_sheet">
      <span class="title-text">table_to_sheet</span>
      <el-button type="primary" size="small" @click="handleExport('table_to_sheet')">导出</el-button>
    </p>

    <p class="aoa_to_sheet">
      <span class="title-text">aoa_to_sheet</span>
      <el-button type="primary" size="small" @click="handleExport('aoa_to_sheet')">导出</el-button>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref } from "vue"
import XLSX from 'xlsx'

// 表头
const tableHeadList: Array<{ prop: string | number, label: string }> = [
  {
    prop: "name",
    label: "姓名"
  },
  {
    prop: "sex",
    label: "性别"
  },
  {
    prop: "address",
    label: "地址"
  }
]
// 表头prop
const headOrder: Array<string | number> = tableHeadList.map(i => i.prop)
// 表单数据
const tableDataList: Array<{ [props: string]: any }> = [
  {
    key: 1,
    name: "王小虎",
    sex: '男',
    address: '上海市普陀区金沙江路 1518 弄'
  },
  {
    key: 2,
    name: "王小虎",
    sex: '男',
    address: '上海市普陀区金沙江路 1518 弄'
  },
  {
    key: 3,
    name: "王小虎",
    sex: '男',
    address: '上海市普陀区金沙江路 1518 弄'
  }
]

const tableRef: Ref<HTMLTableElement | undefined> = ref<HTMLTableElement | undefined>() //table的ref

const workBook: XLSX.WorkBook = XLSX.utils.book_new() // 创建一个工作簿
function handleExport(type: string) {
  let sheet: XLSX.WorkSheet = []
  switch (type) {
    case "table_to_sheet": {
      // 使用table dom生成sheet
      sheet = XLSX.utils.table_to_sheet(tableRef.value as HTMLTableElement)
      break;
    }
    case "aoa_to_sheet": {
      /**
       * 以数据格式生成sheet 
       * [
       *    [column1_1, column1_2], 
       *    [column2_1, column2_2], 
       *    [column3_1, column3_2]
       * ]
       */

      let data: unknown[][] = [[]]
      tableHeadList.forEach((i) => {
        data[0].push(i.label)
      })
      tableDataList.forEach((i) => {
        const length = data.push([])
        headOrder.forEach((j) => {
          data[length - 1].push(i[j])
        })
      })
      sheet = XLSX.utils.aoa_to_sheet(data)
      break;
    }
  }
  XLSX.utils.book_append_sheet(workBook, sheet, type) // 将sheet插入工作簿里
  XLSX.writeFile(workBook, `${type}.xlsx`) // 导出工作簿
}

</script>
<style lang="scss" scoped>
table {
  border: 1px solid;
  border-collapse: collapse;
}
tbody {
  tr {
    border-top: 1px solid;
  }
}
th,
td {
  padding: 11px;
  text-align: center;
  &:not(:last-child) {
    border-right: 1px solid;
  }
}
.title-text {
  margin-right: 20px;
}
</style>