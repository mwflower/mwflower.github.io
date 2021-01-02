+++
title = "Zookeeper源码-配置解析"
author = "mwflower"
date = 2019-04-23T00:00:00+08:00
categories = ["code"]
tags = []
draft = true
+++
# 背景
新部署了一个ZK集群(3.4.10)，在配置server.id时出现了重复的addr，如下：
```
server.1=host1:2888:3888
server.2=host2:2888:3888
server.3=host3:2888:3888
server.4=host4:2888:3888
server.5=host4:2888:3888
```
可以看到，server.4和server.5的addr是一样的。
集群运行一段时间后，B同学发现了该问题，并及时修正，期间集群无任何异常，B同学也表示该配置对集群无影响，只需myid正确即可。事实真是这样吗？持着怀疑的态度，我看了下ZK对配置的解析。
# 配置解析
## 入口
zk进程启动命令为`java ... org.apache.zookeeper.server.quorum.QuorumPeerMain zoo.cfg`，配置文件直接通过命令行传入，依次调用QuorumPeerMain类main -> initializeAndRun -> runFromConfig方法，中间使用QuorumPeerConfig类parse方法解析配置文件，返回config对象；之后集群完成初始化进入工作状态。
zk整个启动流程很清晰，关于配置解析，我们主要关注两点即可：
1. 配置解析过程；
2. 配置用在什么地方；

下面我们进入server.id的解析。

## server.id
QuorumPeerConfig类parse方法调用Properties类将配置文件转化为key-value形式，再调用parseProperties初始化所有成员变量，包括server.id，核心代码如下：
```java
else if (key.startsWith("server.")) {
    long sid = Long.parseLong(key.substring(dot + 1));
    String parts[] = splitWithLeadingHostname(value);
    LearnerType type = null;
    String hostname = parts[0];
    Integer port = Integer.parseInt(parts[1]);
    Integer electionPort = null;
    if (parts.length > 2){
        electionPort=Integer.parseInt(parts[2]);
    }
    servers.put(Long.valueOf(sid), new QuorumServer(sid, hostname, port, electionPort, type));
}
```
逻辑很简单，将value按冒号分隔，生成QuorumServer对象放入servers对象中。
跟踪servers即可知道server.id配置的使用，外部通过getServers方法可获取servers。通过搜索发现只有QuorumPeerMain类调用了getServers，用来设置QuorumPeer对象，又通过getView方法对外提供unmodifiable的servers副本。
我们继续跟踪getView方法的使用，createCnxnManager方法创建QuorumCnxManager对象时调用了该方法，主要使用了QuorumServer中的electionAddr成员，并根据myid与sid的对应关系绑定该地址用于选举。而electionAddr由hostname+electionPort生成，如果server.id对应的hostname:electionPort和myid的实际地址不同时，会导致socket绑定失败，也就是没有打开选举端口，无法参与选举。
# 结论
server.id地址与myid实际机器地址不对应时，会导致zk无法绑定服务端口(2888)和选举端口(3888)，无法参加选举。
