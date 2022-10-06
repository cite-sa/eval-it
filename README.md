# Eval-it

The Eval-it service is a service used by end users and by other services to list, comment, validate and rate datasets and other research material. It allows validation of identifiable items via human driven processes, offering the means to plan a dataset management and offers the tools for assessing the quality both from machine and researcher perspectives.

# Data Model

## Object Type

The Eval-it Service offers the possibility to define custom types of objects to be validated. In recognition to the fact that different research object, but also object of the same type but different scope or discipline, may have different needs in order to be described properly, it offers a configurable way of defining how an object is described and registered.

## Object Registration Attributes

Per Object Type defined, the master data configuration administrator can choose a number of attributes that are relevant to each object type. A wide range of configurable options are made available and the model is extendible to the administrator. Such options include attributes:

* Integer value - An integer value describing the registered object
* Decimal value - A decimal value describing the registered object
* Percentages - An percentage value describing the registered object
* Free text - Free text input describing the registered object
* Scale values - A scale, bound value describing the registered object
* Option selection - A selection from a configurable list of options

Where it applies, the following options are available for each of the possible input options:

* Label describing the expected interpretation of the value
* Validation expression based on regular expression syntax to validate the input
* A measurement unit that described the input value
* Whether the input is mandatory or optional
* Whether the input is single value or the user can select multiple values
* Icons associated with an option (scale options)

## Object Review Metrics

Per Object Type defined, the master data configuration administrator can choose a number of ranking dimensions that are relevant to each object type. A wide range of configurable options are made available and the model is extendible to the administrator. Such options include dimensions:

* Integer value - An integer value ranking the registered object
* Decimal value - A decimal value ranking the registered object
* Percentages - An percentage value ranking the registered object
* Free text - Free text input validating and commenting the registered object
* Scale values - A scale, bound value ranking the registered object
* Option selection - A selection from a configurable list of options

Where it applies, the following options are available for each of the possible ranking options:

* Label describing the expected interpretation of the value
* Validation expression based on regular expression syntax to validate the input
* A measurement unit that described the input value
* Whether the input is mandatory or optional
* Icons associated with an option (scale options)

## Tags

The Service offers a generic tagging mechanism. The master data configuration administrator can define custom tags and configure the type of the tag as well as its applicability (object or users). The tags are a simple approach to both categorize the items they are attached to, but can also be used to drive the ranking process based on the reviews performed.

# Object Registration

At the time of registering an object, an authorized user can describe the object being registered. The metadata included are governed by the Object Registration Attributes defined for the Object Type selected for the registered object.

In addition to the attributes configured to be requested based on the object type, some common information is requested and maintained for each object. Primarily, an object identifier is required to uniquely identify the item. These can be DOIs or other means of persistent identification.

# Review Process

Authorized users can browse the registered objects and place their review. The review dimensions follow the review metrics configuration associated with the object type of the item being reviewed. Based on configuration, users can be limited to one or multiple reviews for the same item. While placing the review, the reviewer can select the visibility of their review as well as whether the review will be anonymous or signed. In case of a private review, the system guarantees a one way association between the user and the review so that based on the review one cannot infer the author, but the association of the reviewer with the review is maintained.

# User Profile

Service users can build their profile within the Service. This includes profile information such as contact info, preferences, Two Factor Authentication, additional authentication providers for their account, notification method etc. Additionally, they can build their network and relations to other users. The network can be build by "following" or "trusting" other users which can be used to prioritize their searches for objects and review browsing. Depending on the type of relation, different weight as well as options are provided by the system operation.

# AAI Integration

## Authentication

Integration with SSO AAI is achieved at the access token level. Authenticated end-users, through the OIDC Token Grant Flow or integrating services through OIDC Client Credential Grant Flow are authenticated and can contact the Service.

## Authorization

The Data Validation Service offers an internal Authorization module that handles the fine grained permission granting process that governs its functionality. Available roles to be assigned to users include: 
* Administrator - System administrator
* Configuration Administrator - Master data configuration management
* User Validator - Validation of registered users to grant application grants
* Object Uploader - User eligible of registering objects to be validated
* Reviewer - User eligible to post reviews on registered objects
* User - Base user browsing objects and reviews

In addition to the internal authorization granting process, the service has integrated with the NEANIAS AAI service to allow for claims granted to users and the central level to be recognized and respected within the service.

# API Client Integration

The Service offers the possibility to define external API clients that will utilize its API for integration purposes through the simplified and widely used api key approach. The API Clients defined are assigned an API key and can be granted specific role assignments that govern the permissions of the integrating service operations.

# License

Licensed under the EUPL-1.2-or-later
