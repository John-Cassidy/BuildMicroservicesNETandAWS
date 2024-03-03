aws dynamodb update-table `
    --table-name HotelsCache `
    --attribute-definitions AttributeName=City,AttributeType=S `
    --global-secondary-index-updates `
    '[
        {
            "Create": {
                "IndexName": "CityIndex",
                "KeySchema": [
                    {
                        "AttributeName": "City",
                        "KeyType": "HASH"
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