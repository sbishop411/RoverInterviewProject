Decision Log
=====

Summary
-----
In an effort to provide some transparency into my decision making process, I'll be maintaining a decision log as I work on the project. 

Architecture Decisions
=====

# Should I use a packaged tech stack (like LAMP or MEAN)?

## Status:
Done

## Context:
Many of the infrastructure concerns of creating and deploying a demo website are handled by packaged tech stacks such as the WAMP/LAMP and <a href="http://mean.io/">MEAN.io</a> stacks. Utilizing one of these stacks _should_ significantly reduce the amount of time that I'll need to spend on the configuration and integration of various libraries. On the other hand, it will force me to use languages, technologies, and configurations that I'm less familiar with.

## Decision:
I've decided against using a packaged tech stack. I believe that many of them will introduce additional overhead and complexity that may not be desirable given the short amount of time in which this project must be completed.

## Consequences:
Most of my experience with unit tests is with .NET, so I'll need to learn how to write and run unit tests in another language. Hopefully I can find a library or framework that will help with this.


# Should I store data in a SQL or NoSQL database?

## Status:
Done

## Context:
We need to determine which kind of database would best serve the type of data that comprises Rover.com's sitter profiles and related reviews. This decision must be made before we can select a technology stack upon which our website will be built.

The data that we'll be storing includes:
- Information about the sitter that looked after the dog, including their name, a description, a photo, their contact information.
- Information about the dog's owner, including their name, a description, a photo, their contact information.
- Information about the stay, including the start date, end date, dog names, and the owner's rating.

The actions that we'll need to perform with the data are as follows:
- Rebuild our sitter profiles and user accounts.
- Recreate a search ranking algorithm
- Build an appealing search results page

## Decision:
I have elected to use a NoSQL database to complete this project, specifically MongoDB. I believe that this kind of data is a prime example of data that may benefit from the additional flexibility that a NoSQL database can offer.

## Consequences:
MongoDB supports virtual model properties, which are ideal for calculated values like the OverallSitterRank. Unfortunately, it can't filter query results or index on these virtual properties, meaning that we'll have to store this value and keep it updated. While MongoDB /does/ offer some useful tools to accomplish this, such as pre and post-save and update hooks, it has already introduced a fair bit of complexity and headaches.

I'm relatively new to NoSQL databases, and as a result, I believe that there are some flaws in how I'm handling relationships between my various models.


# Which tech stack should I use?

## Status:
Done

## Context:
Now that I've decided not to go with a packaged tech stack, I have a bit more freedom to decide what technologies I'd like to use. I'm fairly familiar with .NET stack, but I'm hoping to learn a bit from this exercise, and I have very little experience integrating it with MongoDB. On the other hand, I'm relatively familiar with <a href="http://mongoosejs.com/">Mongoose</a>, a popular Node.js ORM for MongoDB.

Furthermore, unit testing appears to be a priority in this exercise, so I should try to pick a tech stack that either comes with a unit testing framework built-in, or can easily integrate with one.

## Decision:
I have elected to use the MEAN stack to complete this project. I have some prior experience with it, it includes a NoSQL database which is ideal for the data we'll be working with, and it integrates easily with <a href="https://mochajs.org/">Mocha</a>, a Node.js testing framework. While I've never used Mocha before, I'll probably spend less time learning it and setting up tests than I'd spend on getting the configuration and integration correct with .NET.

## Consequences:
Due to my relative inexperience with troubleshooting issues on the MEAN stack, I ran into a LOT of headaches while implementing this project, and there are still some outstanding issues in the Stay API. Contrary to my initial thoughts, Mongoose gave me a lot of trouble, as its pre- and post-hook functionality is rather unintuitive.

Furthermore, my inexperience with asynchronous JavaScript really came into play here. I learned a LOT during this process, but there were definitely some stumbling points along the way.


Data Structure
=====

# How should I structure the data models?

## Status:
Done

## Context:
Rover was able to recover some sitter review data from a Google index scrape. I've been tasked with rebuilding the sitter profiles, which means I need to develop good data models for this data to fit in.

- Rating
- Sitter Image
- End Date
- Text
- Owner Image
- Dogs
- Sitter
- Owner
- Start Date
- Sitter Phone Number
- Sitter Email
- Owner Phone Number
- Owner Email

## Decision:
I've decided to implement the following data models to represent the scraped data:

- Sitter
    - Unique ID
        - This data does not exist, and will be generated when the data is loaded into the new data store.
    - Name
        - This field is based on the original "sitter" column.
    - Image
        - This field is based on the original "sitter_image" column.
    - PhoneNumber
        - This field is based on the original "sitter_phone_number" column.
    - EmailAddress
        - This field is based on the original "sitter_email" column.
    - Stays
        - This will be a collection of references to all Stays that are associated with this Sitter.
    - NumberOfStays
        - This is a helper property to expose the length of the Stays array.
        - This is implemented as a virtual property.
    - SitterScore
        - This value is 5 times the fraction of the English alphabet comprised by the distinct letters in the sitter's name.
        - E.g - "Scott B." is comprised of 5 unique letters, so my Sitter Score would be (5/26) * 5, or about 0.961.
        - This is implemented as a virtual property.
    - RatingsScore
        - This value is the average of the Rating value on all associated stays.
        - Since we need to search on this value, and thus index it, this had to be implemented as a stored denormalized value.
    - Overall Sitter Rank
        - This is a weighted average of the Sitter Score and Ratings Score, weighted by the number of stays.
            - If a sitter has no stays, this is equal to the Sitter Score.
            - If a sitter has 10 or more stays, this is equal to the Ratings Score.
        - What should we do if the sitter has between 0 and 10 stays? What rating function should we use?
        - Since we need to sort on this value, this had to be implemented as a stored denormalized value.

- Owner
    - Unique ID
        - This data does not exist, and will be generated when the data is loaded into the new data store.
    - Name
        - This field is based on the original "owner" column.
    - Image
        - This field is based on the original "owner_image" column.
    - PhoneNumber
        - This field is based on the original "owner_phone_number" column.
    - EmailAddress
        - This field is based on the original "owner_email" column.

- Stay
    - Unique ID
        - This data does not exist, and will be generated when the data is loaded into the new data store.
    - Owner
        - This will be expressed through a reference to a Owner model.
    - Dogs
        - This field is a list of names that is delimited by the '|' character.
        - This field is based on the original "dogs" column.
    - StartDate
        - This field is based on the original "start_date" column.
    - EndDate
        - This field is based on the original "end_date" column.
    - ReviewText
        - This field is based on the original "text" column.
    - Rating
        - This field is based on the original "rating" column.

## Consequences:
I had initially thought that the ability to model the RatingsScore and OverallSitterRank as virtuals would be incredibly helpful, but then I realized that MongoDB wouldn't be able to search by or index based on these values unless they were actually persisted on the Sitter documents. This means that any time a sitter's Name changed, a stay is added/removed, or a stay rating is updated, we have to recalculate and re-save these values. To make matters worse, I chose to implement the relationship between sitters and stays as a reference, so the necessary stay data - the rating value - isn't included by default when reading a sitter from the database. I may have been able to avoid this by looking into and implementing views, but I'm not sure if this would have solved the problem.


# Should stays be embedded in the sitter record, or referenced by ID?

## Status:
Done

## Context:
I need to determine how the sitter/stay relationship should be constructed. If we expect to get many reviews (and we might), it could be a good idea to keep a collection of references to them

## Decision:
I'll implement the sitter/stay relationship by storing a collection of ObjectId references to stays on the sitter model. This seems to provide the best of both worlds, at least at this scale.

## Consequences:
While this approach has some advantages, I think that it was a major stumbling point of this project.

To start with, maintaining the list of stays on the sitter is a bit of a pain. Since it doesn't make sense for a Stay to exist independent of a sitter, this means that we need to be able to associate a stay with a sitter when we're adding it. Furthermore, when a stay is deleted, we need to remove the reference to it from the sitter's Stays list too. At the end of the day, I'm not sure whether or not the reduction in overhead cost of reading and returning all associated stay information is worth the potential data integrity issues that I introduced by implementing this as a list of references.

Additionally, I've already addressed some of the issues that arose from having to recalculate the RatingsScore and OverallSitterRank in my previous decision log on the data models. Please see that decision log for more insight.


# Should I create a separate model for individual dogs?

## Status:
Done

## Context:
Each stay could have involved multiple dogs, which presumably belong to the same owner. Given the multiplicity of this relationship and the possibility of needing to store additional information on each individual dog (e.g. allergies, special needs, etc.), I may want to consider creating a separate Dog model that can be associated with both an owner and a Stay.

I doubt that modeling the data in this way will provide a positive impact in terms of the project requirements, but may be a useful to implement if there's enough time.

## Decision:
I've decided to leave the Dogs field as it. According to the requirements of this project, there's no need to create a separate model for Dogs, and I'm short on time as it is.

## Consequences:
None. For once, I think I made the right choice.


Code Organization
=====

# Should the Angular base page (index.html) be moved from the client directory into the server directory?

## Status:
Done

## Context:
The index.html page is responsible for including all of the necessary libraries that allow Angular to do it's thing. In a single page app, index.html is that single page. It may be a good idea to move this page into the /server directory, since it's not really an Angular view, and is an artifact that's actually served up by Express.

## Decision:
No. In fact, it would be very problematic if I did this. Express defines a specific "public" directory, which must contain all files that it will be responsible for serving over the network. If I were to move it out of the public directory, Express wouldn't be able to serve it to users.

## Consequences:
None. Choosing to leave the index.html file where it is was the right choice.

Furthermore, I was able to implement some shared web page infrastructure (page header and nav bar) on index.html. Ideally, I'd be able to implement shared infrastructure like this using ui-router, but I didn't have enough time to work that in.
