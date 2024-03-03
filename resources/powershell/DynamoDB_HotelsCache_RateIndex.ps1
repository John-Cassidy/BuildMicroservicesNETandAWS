aws dynamodb update-table `
    --table-name HotelsCache `
    --attribute-definitions AttributeName=Constant,AttributeType=S AttributeName=Rating,AttributeType=N `
    --global-secondary-index-updates `
    '[
        {
            "Create": {
                "IndexName": "RatingIndex",
                "KeySchema": [
                    {
                        "AttributeName": "Constant",
                        "KeyType": "HASH"
                    },
                    {
                        "AttributeName": "Rating",
                        "KeyType": "RANGE"
                    }
                ],
                "Projection": {
                    "ProjectionType": "ALL"
                },
                "ProvisionedThroughput": {
                    "ReadCapacityUnits": 1,
                    "WriteCapacityUnits": 1
                }
            }
        }
    ]'