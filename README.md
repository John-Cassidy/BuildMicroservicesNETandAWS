# BuildMicroservicesNETandAWS

Event-Driven Microservices with Dotnet and AWS, Lambda, Docker, Kafka, RabbitMQ

[Udemy Course](https://www.udemy.com/course/build-microservices-with-aspnet-core-amazon-web-services/)

[Course Frontent Github Repo](https://github.com/aussiearef/MicroservicesWithAWS_FrontEnd)

## Install or update the AWS CLI

[Configure the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

```powershell
# enter credentials in comman line:
aws configure

# AWS Access Key ID
# AWS Secret Access Key
# AWS Region (Default)

cd
cd .aws/

# view configuration / credentials
cat config
cat credentials

# edit credentials manually in file:
nano credentials
notepad credentials
```

## Identity and Access Managemetn with AWS Cognito

## API Gateway

The API Gateway pattern is a design pattern in microservices architecture that provides a single entry point for different types of clients (like web, mobile, and others) to access the diverse microservices in the system.

Here are the key points about the API Gateway pattern:

Single Entry Point: It acts as a single point of entry into a system. This can simplify the client by moving the user-specific handling of the microservices into the API gateway.

Routing: It routes requests from clients to the appropriate microservice. The routing is based on the request type and the available resources.

Aggregation: It can aggregate responses from multiple microservices and return them to the client as a single response. This can reduce the number of requests between the client and the server.

Authentication and Authorization: It can handle authentication and authorization tasks, thus offloading these responsibilities from the microservices.

Rate Limiting and Caching: It can also handle rate limiting to prevent DoS attacks and can cache responses to improve performance.

Fault Isolation: It can isolate failures in the system, preventing them from cascading to other parts of the system.

Service Offloading: It can offload services like SSL termination, request object validation, response object validation, and other cross-cutting concerns.

In essence, the API Gateway pattern is a way to hide the underlying system's complexity from the client, providing a simpler interface for the client to interact with.

### AWS API Gateway

Create API Gateway
