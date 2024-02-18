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

## Add Tag Name to all AWS Resources for tracking purposes

### To list all resources that have a tag name of "Project" and value of "hotel-booking", you can use the AWS CLI list-tags-for-resource command

The AWS CLI command provides a simple way to list tags for a single resource. For listing resources across multiple services, AWS Resource Groups Tagging API or AWS Resource Explorer would be more suitable options.

1. Use the `list-tags-for-resource` command along with the `--resource-arn` flag to specify the ARN of the resource you want to get tags for.

```powershell
aws medialive list-tags-for-resource --resource-arn arn:aws:medialive:region:account-id:resource-id
```

2. The output will list all tags attached to the specified resource. You can then filter for the "Project" tag with value "hotel-booking".

### Use AWS Resource Explorer service in the AWS Management Console To list resources across multiple services with the specified tags

NOTE: Before you can search for the resources you must turn on and setup Resource Explorer. AWS Resource Explorer does not have any additional cost to use.

To list resources across multiple services with specified tags using AWS Resource Explorer:

1. Go to the AWS Resource Explorer console at [https://console.aws.amazon.com/resource-explorer](https://console.aws.amazon.com/resource-explorer)

2. On the navigation pane on the left, select "Views" and then click "Create view".

3. Give the view a name and select the AWS accounts and regions you want to include.

View Name: Project--hotel-booking

4. Under "Filters", click "Add filter" and select "Tag" as the filter type. Specify the key as "Project" and the value as "hotel-booking".

5. Click "Create view". This will create a view that includes resources from the selected accounts and regions that have the specified tag.

Filter: tag.key:Project tag.value:hotel-booking

6. On the navigation pane, select the view you just created. You will see a list of all resources across services like EC2, RDS, Lambda etc. that have the "Project" tag with value "hotel-booking".

7. You can also search for resources using the search bar at the top and specifying the tag as a search filter.

NOTE: To list resources across multiple services with the specified tags, you can use the AWS Resource Groups Tagging API or the AWS Resource Explorer service in the AWS Management Console

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

## HotelManagement

Create Microservice HotelManagement based on [Course Repository](https://github.com/aussiearef/MicroservicesWithAWS_Dotnet_HotelMan)

![Microservice Chassis Diagram 1](./resources/screenshots/01_MicroserviceChassis_Diagram.png)

![Microservice Chassis Diagram 2](./resources/screenshots/02_MicroserviceChassis_Diagram.png)

```powershell
mkdir HotelMagemementLambda
# create solution
dotnet new sln -n HotelManagement
# create HotelManagement classlib project
dotnet new classlib -o HotelManagement
# add project to solution
dotnet sln add HotelManagement

# install AWS Lambda Tools
dotnet tool install -g Amazon.Lambda.Tools
# update AWS Lambda Tools
dotnet tool update -g Amazon.Lambda.Tools

# Package Lamba from csproj file folder
dotnet lambda package --project-location ./HotelMagemementLambda/HotelManagement/ --configuration Release --framework net6.0 --output-package ./resources/releases/HotelManagement.zip
```

### Create .NET 6.0 AddHotel Lambda

Upload Zip file
Edit Runtime Settings to:

- `AssemblyName::Namespace.ClassName::MethodName`
- HotelManagement::HotelManagement.HotelAdmin::AddHotel
