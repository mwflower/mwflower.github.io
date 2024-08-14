+++
title = "经典排序算法"
author = "mwflower"
date = 2019-05-21T00:00:00+08:00
categories = ["study"]
tags = []
draft = false
toc = true
+++
# 序  
排序算法主要有四种：  
1. 交换排序：如冒泡排序，快速排序  
2. 选择排序：如直接选择排序，堆排序  
3. 插入排序：如直接插入排序，希尔排序  
4. 合并排序：如归并排序  
  
下面我们一起来聊聊这些算法，并用python做简单的实现。  
首先我们总体看看这些算法的优点及应用：  
|排序法     |最差时间分析   |平均时间复杂度 |稳定度 |空间复杂度         |应用              |备注                           |  
|-----------|---------------|---------------|-------|-------------------|------------------|-------------------------------|  
|冒泡排序   |O(n2)          |O(n2)          |稳定   |O(1)               |n 小时较好        |n很小时比快排快                   |  
|快速排序   |O(n2)          |O(n*log2n)     |不稳定 |O(log2n)~O(n)      |n 大时较好        |n大时，最差情况也比冒泡表现好       |  
|选择排序   |O(n2)          |O(n2)          |稳定   |O(1)               |n 小时较好        |比冒泡表现好，交换次数少                            |  
|堆排序     |O(n*log2n)     |O(n*log2n)     |不稳定 |O(1)               |n 大时较好        |比选择排序好点，比较次数更少；没快排快                            |  
|插入排序   |O(n2)          |O(n2)          |稳定   |O(1)               |大部分已排序时较好|比冒泡表现好；和选择排序类似，但程序中数据交换更多                            |  
|希尔排序   |...        |...       |不稳定 |O(1)               |...               |时间复杂度计算与所取增量序列的有关，涉及到一些数学上尚未解决的难题；实践好像比快排还快 ?o?                            |  
|归并排序   |O(n*logn)      |O(n*logn)      |稳定   |O(n)               |n 大时较好        |...                            |  
|基数排序   |O(logRB)       |O(logRB)       |稳定   |O(n)               |...               |B是真数(0-9)，R是基数(个十百)  |  
|二叉树排序 |O(n2)          |O(n*log2n)     |不一定 |O(n)               |...               |...                            |  
  
再作一点准备工作，定义一个装饰器来衡量时间复杂度，并import相关的包，创建随机数组。  
```python  
import time  
import random  
import copy  
from functools import wraps  
def function_timer(func):  
    @wraps(func)  
    def func_timer(*args, **kwargs):  
        t0 = time.time()  
        result = func(*args, **kwargs)  
        t1 = time.time()  
        print ("Total time running %s: %s seconds" % (func.func_name, str(t1-t0)))  
        return result  
    return func_timer  
  
arr = [random.randint(100, 1000000) for i in range(10000)]  
```  
现在我们一起来愉快地实现这些常见的算法吧。  
  
# 冒泡排序  
  
## 思想  
因类似水里面冒泡的现象而得名，轻的泡泡不断往上浮，最后重泡泡都在轻泡泡下面，也就完成了排序。  
假设有一个数组：[50, 20, 70, 10]；  
我们循环遍历数组，从后往前遍历，小数前移，大数后移；  
第一次遍历：10比70大，交换顺序；20比10大，交换顺序；50比10大，交换顺序；得到新的数组[10, 50, 20, 70]。  
多次遍历后即得到有序数组[10, 20, 50, 70].  
  
## 实现  
```python  
@function_timer  
def bubble_sort(arr):  
    arr_len = len(arr)  
    # 遍历arr_len - 1遍  
    for i in range(1, arr_len):  
        # 遍历指定元素  
        for j in range(1, arr_len - i + 1):  
            if arr[arr_len - j] < arr[arr_len - j - 1]:  
                arr[arr_len - j], arr[arr_len - j - 1] = arr[arr_len - j - 1], arr[arr_len - j]  
    return arr  
bubble_sort(copy.copy(arr))  
```  
  
## 分析  
需要遍历n^2遍，时间复杂度高。  
  
# 快速排序  
  
## 思想  
主要过程是通过3个锚点base、left、right，不断交换左右两边数据，切分数组，实现排序。  
核心思想是遍历一次后，base左边的值都比base小，右边大，不断迭代，最终实现有序。  
假设有一个数组：[50, 20, 70, 10, 30]；  
第一次遍历：base、left初始指向50，right指向30；right向前找，如果找到比base小的数，将这个小数赋值给left，right指向该数，此时数组为[30, 20, 70, 10, 30]；left先后找，如果找到比base大的数，将这个大数赋值给right，left指向该数，此时数组为[30, 20, 70, 10, 70]，left、right都指向70;left、right重复上面的步骤，直至重合,最后将base值50赋值给重合点，此时数组为[30, 20, 10, 50, 70]，50左边的数都比50小，右边的数都比50大。  
第二次遍历：以50为分割点，左右两边分别按照第一遍遍历的方法排序。  
...  
  
## 实现  
```python  
@function_timer  
def quick_sort_iteration(arr):  
    left, right = 0, len(arr) - 1  
    stack = [(left, right)]  
    while stack:  
        left, right = stack.pop(0)  
        if left >= right:  
            continue  
        base = arr[left]  
        l, r = left, right  
        while l < r:  
            while arr[r] > base and l < r:  
                r -= 1  
            arr[l] = arr[r]  
            while arr[l] <= base and l < r:  
                l += 1  
            arr[r] = arr[l]  
        arr[l] = base  
        stack.append((left, l - 1))  
        stack.append((l + 1, right))  
    return arr  
quick_sort_iteration(copy.copy(arr))  
```  
  
## 分析  
在n很大时，快排比冒泡效率高非常多。  
  
# 直接选择排序  
  
## 思想  
非常直接的排序，从数组中找到最小的数，放到第一位，然后找到第二小数放到第二位，依次类推，就完成了排序。  
假设有一个数组：[50, 20, 70, 10]；  
从左往右遍历，找到最小数，然后交换两数位置，索引加1；  
第一次遍历：找到10最小，将10和50交换，数组变为[10, 20, 70, 50]；  
第二次遍历：20最小，不用交换；  
第三次遍历：50最小，将70和50交换，得到[10, 20, 50, 70]，排序完成。  
  
## 实现  
```python  
@function_timer  
def select_sort(arr):  
    for i in range(len(arr) - 1):  
        min_index = i  
        for j in range(i + 1, len(arr)):  
            if arr[j] < arr[min_index]:  
                min_index = j  
        if min_index != i:  
            arr[i], arr[min_index] = arr[min_index], arr[i]  
    return arr  
  
select_sort(copy.copy(arr))  
```  
  
## 分析  
时间复杂度为n^2，但各方面表现都比冒泡好。  
  
# 堆排序  
  
## 思想  
建立一个完全二叉树，从一个无序序列建堆的过程就是一个反复筛选的过程，筛选从 n/2 向下取整的非叶子节点开始，比较中间节点和左、右节点的大小，从而调整次序，左右节点间不比较大小。  
堆排序分大顶堆和小顶堆，大顶堆的中间节点比左右节点都大，小顶堆则相反。  
构造堆过程，从最后一个非叶子结点开始：  
  
![大顶堆.png][1]  
  
筛选过程，从堆顶开始，通过不断筛选，即可输出一个从小到大的有序数列：  
  
![大顶堆筛选.png][2]  
  
提示：中间节点位置为n，则左节点位置为2n+1，右节点2n+2(从0计数)。  
  
## 实现  
```python  
def heap_adjust(arr, parent, length):  
    child = 2 * parent + 1  
    while child < length:  
        if child + 1 < length and arr[child] < arr[child + 1]:  
            child += 1  
        if arr[parent] > arr[child]:  
            break  
        arr[parent], arr[child] = arr[child], arr[parent]  
        parent = child  
        child = 2 * parent + 1  
  
@function_timer  
def heap_sort(arr):  
    arr_len = len(arr)  
    # 构建堆  
    for i in range(arr_len / 2 - 1, -1, -1):  
        heap_adjust(arr, i, arr_len)  
    # 筛选  
    for i in range(arr_len - 1, 0, -1):  
        arr[0], arr[i] = arr[i], arr[0]  
        heap_adjust(arr, 0, i)  
    return arr  
```  
  
## 分析  
比直接选择排序快，构造完堆后就处于相对有序状态；当n大是比快排慢；原地排序，不占用额外空间。  
适合Top K问题。  
  
# 直接插入排序  
  
## 思想  
类似玩斗地主时摸排的情形，摸个5，我们就会插入4和6中间，最后一手牌就按从小到大排好序了。  
假设有一个数组：[50, 20, 70, 10, 30]；  
从左到右遍历每个元素，该元素向前查找一个左边比自己小，右边比自己大的位置，然后插入该位置。当遍历完所有元素后，即排序完成。  
排序过程中，数组前半部分是有序的，后半部分是无序的。  
  
## 实现  
```python  
@function_timer  
def insert_sort(arr):  
    for i in range(1, len(arr)):  
        tmp = arr[i]  
        for j in range(i - 1, -1, -1):  
            if arr[j] < tmp:  
                arr[j + 1] = tmp  
                break  
            arr[j + 1] = arr[j]  
            if j == 0:  
                arr[j] = tmp  
                break  
    return arr  
# print insert_sort(copy.copy(arr))  
```  
PS：将j放在循环外赋值，改for循环为while，可减少j==0的判断，代码更简洁。  
  
## 分析  
时间复杂度类似直接选择排序，直接选择排序是不断遍历，找到最值放到数组最前面；直接插入排序是不断将新数插入有序数组的适当位置；但直接插入排序的在顺序表中需要不断移动旧数位置，代价更大。  
  
# 希尔排序  
  
## 思想  
又称“缩小增量排序”（Diminishing Increment Sort），是直接插入排序算法的一种更高效的改进版本，主要基于以下两点性质：  
1. 插入排序在对几乎已经排好序的数据操作时可以达到线性排序的效率；  
2. 比较相隔较远的数，使数据移动时可以跨过多个元素，避免多个元素的交换；  
  
每次对相隔增量step的子数组使用直接插入法排序；一般第一次增量为len/2，第二次为len/2/2；当增量为1时，就是直接插入排序了。  
假设有一个数组：[50, 20, 70, 10, 30, 60, 40, 20]；  
第一次比较，step=4：  
第二次比较，step=2：  
第三次比较，step=1：  
  
## 实现  
```python  
@function_timer  
def shell_sort(arr):  
    arr_len = len(arr)  
    step = arr_len >> 1  
    while step >= 1:  
        for i in range(step, arr_len):  
            tmp = arr[i]  
            j = i  
            while j >= step and arr[j - step] > tmp:  
                arr[j] = arr[j - step]  
                j -= step  
            arr[j] = tmp  
        step = step >> 1  
    return arr  
```  
  
## 分析  
希尔排序的时间复杂度计算是一个数学难题，与所选增量序列有关；本次实践，在百万数量级下，希尔排序比快排快10倍以上，和网上资料有很大出入，像出了bug似的，真是神奇的算法。  
附某篇[时间复杂度计算][3]文，仅供参考。  
  
# 归并排序  
  
## 思想  
采用分治法思想，首先将数组不断分片，直到每个子数组只包含一个元素，然后不断合并排序两边的数组，最后合并为一个数组。  
  
![归并排序.jpg][5]  
  
## 实现  
```python  
def merge_sort(arr):  
    if len(arr) < 2:  
        return arr  
    mid = len(arr) / 2  
    left, right = arr[:mid], arr[mid:]  
    return merge(merge_sort(left), merge_sort(right))  
  
def merge(left, right):  
    result = []  
    while left and right:  
        if left[0] < right[0]:  
            result.append(left.pop(0))  
        else:  
            result.append(right.pop(0))  
  
    while left:  
        result.append(left.pop(0))  
    while right:  
        result.append(right.pop(0))  
    return result  
```  
  
## 分析  
归并排序的最好，最坏，平均时间复杂度均为O(nlogn)。  
  
  
  [1]: /self/img/2019/05/3459869311.png  
  [2]: /self/img/2019/05/3708366271.png  
  [3]: https://zhuanlan.zhihu.com/p/31173825  
  [5]: /self/img/2019/08/3827496922.jpg  
