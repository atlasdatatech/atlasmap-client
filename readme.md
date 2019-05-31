# Cloud App 地图云

初始化提交时在package.json中省略以下参数，后面需加上

```json
script: {
  "precommit": "lint-staged"
}
```

```json
  "lint-staged": {
    "*.{js,jsx}": [
      "eslint --fix",
      "git add"
    ]
  },
```