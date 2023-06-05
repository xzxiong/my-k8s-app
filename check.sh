#!/bin/bash

get_itself() {
    if [ "`uname -a | grep -w Darwin | wc -l | awk '{print $1}'`" == "1" ] ; then
        greadlink -f $0
    else
        readlink -f $0
    fi
}


default_branch=agent
itself=`get_itself`
basedir=`dirname $itself`
cd $basedir

log_file=mo-agent.log
max_file_cnt=10
function shrink_file()
{
    ## Usage: shrink_file <log_file> <max_file_cnt>
    ## input
    local file=$1
    local max_file_cnt=$2
    if [ ! -f $file  ];then
        return 1
    fi
    if [ -z "$max_file_cnt" ]; then
        max_file_cnt=10
    fi
    ## main
    local file_size=0
    if [ "`uname -a | grep -w Darwin | wc -l | awk '{print $1}'`" == "1" ] ; then
        file_size=`du -k $file | awk '{print $1}'`
        let file_size=$file_size*1024
    else
        file_size=`du -b $file | awk '{print $1}'`
    fi
    if [ $? -ne 0  ];then
        return 2
    fi
    max_size=32000000  #32M
    if [ $file_size -lt $max_size  ];then
        return 3
    fi
    for ((idx=$max_file_cnt-1;idx>0;idx--))
    do
        let next_idx=$idx+1
        local src_file="${file}.${idx}"
        local dst_file="${file}.${next_idx}"
        [ -e "$src_file" ] && mv "${src_file}" "${dst_file}"
    done
    [ -e "$file" ] && mv ${file} ${file}.1
    return 0
}

exec_cmd() {
    cmd=$@
    echo "cmd: $cmd"
    $cmd
}

usage() {
    cat << EOF
usage: $0 [branch]
like:
       $0 pod
options:
    branch   - default: $default_branch
                pod, show all pods
                logs, get logs -f
                port-moob, port-forward 8080
                port-mo, port-forward 6011
                port-grafana, port-forward 3001
                secret, get secret from k8s
branch
    secret
    usage: $0 secret <name> <namespace> <key>
    like : $0 secret prom-grafana  monitoring admin-password
EOF
}

if [ "$1" == "-h" -o "$1" == "--help" ]; then
    usage
    exit 1
fi

branch=$1
shift 1


ulimit -n 102400
case "$branch" in
    pod)
        exec_cmd kubectl get pod -A
        ;;
    logs)
        pod=$1
        ns=$2
        if [ -z "$ns" ]; then ns='xiezexiong'; fi
        exec_cmd kubectl -n $ns logs -f $pod
        ;;
    port-moob)
        pod=$1
        ns=$2
        if [ -z "$ns" ]; then ns='mo-observability-agent'; fi
        exec_cmd kubectl -n $ns port-forward $pod 8080:8080
        ;;
    port-mo)
        pod=$1
        ns=$2
        if [ -z "$ns" ]; then ns='xiezexiong'; fi
        if [ -z "$pod" ]; then pod='mo-tp-cn-0'; fi
        exec_cmd kubectl -n $ns port-forward $pod 6011:6001
        ;;
    port-grafana)
        pod=$1
        ns=$2
        if [ -z "$ns" ]; then ns='mo-ob'; fi
        exec_cmd kubectl -n $ns port-forward $pod 3001:3000
        ;;
    secret)
        name=$1
        ns=$2
        key=$3
        kubectl get secret -n $ns $name -o yaml | grep $key | while read _1 val; do echo $val | base64 -d ; done
        echo
        ;;
    *)
        echo "[ERROR] unknown [branch]: $branch"
        usage
        exit 1
        ;;
esac
