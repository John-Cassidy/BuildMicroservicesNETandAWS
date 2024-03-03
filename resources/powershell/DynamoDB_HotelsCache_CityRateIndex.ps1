aws dynamodb update-table `
    --table-name HotelsCache `
    --attribute-definitions AttributeName=City,AttributeType=S AttributeName=Rating,AttributeType=N `
    --global-secondary-index-updates `
    '[
        {
            "Create": {
                "IndexName": "CityRatingIndex",
                "KeySchema": [
                    {
                        "AttributeName": "City",
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