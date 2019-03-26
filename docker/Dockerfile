FROM python:3.6.2

# set sys_time
RUN rm -rf /etc/localtime && ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN rm -rf /etc/timezone

RUN pip install --upgrade pip

# install python package
ADD ["requirements.txt", "."]
RUN pip install -r requirements.txt

WORKDIR /root/www
CMD ["/bin/bash"]