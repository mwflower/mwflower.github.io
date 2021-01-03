+++
title = "经典查找算法"
author = "mwflower"
date = 2019-08-06T00:00:00+08:00
categories = ["study"]
tags = ["draft"]
draft = false
+++
# 概述  
线性查找分为顺序查找和二分查找。  
查找有两种形态，破坏性查找和非破坏性查找，非破坏性查找不会改变数据结构。  
  
# 顺序查找  
  
## 思想  
从头到尾顺序遍历一遍，很简单直接的方法。  
  
# 二分查找  
  
## 思想  
假设一个从小到大的有序序列，取中间值和目标比较，如果中间值大，则下一步比较中间值之前的序列，否则比较中间值之后的序列。依次循环，直到找到目标值或遍历结束。  
  
## 实现  
```python  
def bin_search(arr, key):  
    low, high = 0, len(arr) - 1  
    while low < high:  
        mid = (low + high) / 2  
        print("mid = {mid}, low = {low}, high = {high}".format(mid = mid, low = low, high = high))  
        if key < arr[mid]:  
            high = mid - 1  
        elif key > arr[mid]:  
            low = mid + 1  
        else:  
            return mid  
        if key < arr[low] or key > arr[high]:  
            break  
    return None  
```  
  
## 分析  
有序序列时间复杂度为O(nlogn)；  
无序序列时间复杂度为排序+查找=O(nlogn)+O(nlogn)，最快的排序算法时间复杂度为O(nlogn)；  
只适用于线性结构的数据。  
  
# 插值查找  
  
## 思想  
核心在于插值的计算公式 (key-a[low])/(a[high]-a[low])*(high-low)。  
基于二分查找，将查找点的选择改进为自适应选择，可以提高查找效率，也属于有序查找。  
对于表长较大，而关键字分布又比较均匀的查找表来说，插值查找算法的平均性能比折半查找要好的多。反之，数组中如果分布非常不均匀，那么插值查找未必是很合适的选择。  
  
## 实现  
```python  
def insert_search(arr, key):  
    low, high = 0, len(arr) - 1  
    while low < high:  
        # 核心：计算mid公式  
        mid = low + (high - low) * (key - arr[low]) / (arr[high] - arr[low])  
        print("mid = {mid}, low = {low}, high = {high}".format(mid = mid, low = low, high = high))  
        if key < arr[mid]:  
            high = mid - 1  
        elif key > arr[mid]:  
            low = mid + 1  
        else:  
            return mid  
        if key < arr[low] or key > arr[high]:  
            break  
    return None  
```  
  
## 分析  
时间复杂性：如果元素均匀分布，则O(log(logn))，在最坏的情况下可能需要 O(n)。  
空间复杂度：O(1)。  
对增量均匀的查找速度更快。  
  
# 哈希查找  
  
## 思想  
通过hash函数，实现O(1)的查找。如输入5，通过函数直接返回2。  
哈希需要遵循两个规则：  
(1) Key尽可能分散，避免多个Key指向同一个值。  
(2) 哈希函数尽可能简单，避免造成资源浪费在哈希函数上。  
  
常用哈希算法：  
(1) 直接定址法：key=Value+C；这个“C"是常量。Value+C其实就是一个简单的哈希函数。  
(2) 除法取余法：key=value%C；  
(3) 数字分析法：比如有一组value1=112233，value2=112633，value3=119033，针对这样的数我们分析数中间两个数比较波动，其他数不变。那么我们取key的值就可以是key1=22,key2=26,key3=90。  
(4) 平方取中法。  
(5) 折叠法：比如value=135790，要求key是2位数的散列值。那么我们将value变为13+57+90=160，然后去掉高位“1”,此时key=60，哈哈，这就是他们的哈希关系，这样做的目的就是key与每一位value都相关，来做到“散列地址”尽可能分散的目地。  
  
冲突解决办法：  
(1) 开放地址法：其实就是数组中未使用的地址。也就是说，在发生冲突的地方，后到的那个元素（可采用两种方式:线性探测，函数探测）向数组后寻找"开放地址“然后把自己插进入。  
(2) 链接法：在每个元素上放一个”指针域“，在发生冲突的地方，后到的那个元素将自己的数据域抛给冲突中的元素，此时冲突的地方就形成了一个链表。  
  
## 实现  
设计函数采用：”除法取余法“。  
冲突方面采用:”开放地址线性探测法"。  
### TODO  
  
## 分析  
  
# 索引查找  
  
  
# 二叉排序树  
  
## 思想  
树的定义：若根节点有左子树，则左子树的所有节点都比根节点小；若根节点有右子树，则右子树的所有节点都比根节点大，如图：  
  
![二叉树.png][1]  
  
### 插入数据  
如插入3到这颗树中：  
3比6小，3与6的左子树比较；  
3比4小，3与4的左子树比较；  
3比2大，将3插入2的右子树。  
  
![二叉树2.png][2]  
  
### 查找数据  
按照插入数据的逻辑查找即可。  
  
### 删除数据  
  
  
  
  [1]: /self/img/2019/08/1276987458.png  
  [2]: /self/img/2019/08/561276523.png  
