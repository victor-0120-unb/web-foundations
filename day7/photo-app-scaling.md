
# SnapShare Photo App: Scaling Plan

## 1. Assumptions

This plan uses the following assumptions:

- SnapShare has 10 million registered users.
- 10% of registered users are active each day.
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Each original photo averages 2 MB.
- Each photo has one thumbnail averaging 50 KB.
- One day has 86,400 seconds, and one year has 365 days.
- All uploaded photos and thumbnails are retained for one year.
- Storage calculations use decimal units: 1 TB = 1,000,000 MB.
- Peak feed traffic is five times the average feed traffic.
- Feed views represent requests for pages of photos, not individual photo downloads.
- The estimates exclude backups, database metadata, storage replication, and other operational overhead.

### Daily active users

Daily active users (DAU) = Registered users × Daily active percentage

DAU = 10,000,000 × 0.10

**DAU = 1,000,000 users**

## 2. Traffic and Storage Calculations

### A. Photo uploads per second

Daily uploads = Daily active users × Photos uploaded per user

Daily uploads = 1,000,000 × 1 = 1,000,000 photos

Average uploads per second = Daily uploads ÷ Seconds per day

Average uploads per second = 1,000,000 ÷ 86,400

**Average uploads per second ≈ 11.57**

The system must handle approximately 12 photo uploads per second on average. Actual upload traffic may vary throughout the day.

### B. Feed views per second

Daily feed views = Daily active users × Feed pages viewed per user

Daily feed views = 1,000,000 × 50

Daily feed views = 50,000,000 feed views

Average feed views per second = 50,000,000 ÷ 86,400

**Average feed views per second ≈ 578.70**

Peak feed views per second = Average feed views per second × 5

Peak feed views per second = 578.70 × 5

**Peak feed views per second ≈ 2,894**

The application should be designed to handle approximately 2,894 feed requests per second during peak periods.

### C. Photo storage per year

Original photo storage per day:

1,000,000 × 2 MB = 2,000,000 MB = 2 TB

Original photo storage per year:

2 TB × 365 = **730 TB**

Thumbnail storage per day:

1,000,000 × 50 KB = 50,000,000 KB = 50 GB

Thumbnail storage per year:

50 GB × 365 = **18.25 TB**

Total photo storage per year:

730 TB + 18.25 TB = **748.25 TB per year**

This estimate covers original photos and thumbnails only. Actual capacity requirements will be higher if backups, replicas, additional image sizes, or other stored data are included.

## 3. Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because users view many feed pages compared with the number of photos they upload.

Each active user generates approximately 50 feed views and one photo upload per day. Feed views therefore occur about 50 times as often as photo uploads.

This affects the design in several ways:

- Use a CDN to serve photos and thumbnails close to users.
- Use a cache to reduce repeated database queries for popular feeds and metadata.
- Use a database read replica to handle read queries without overloading the primary database.
- Scale application servers horizontally to handle changing traffic.
- Process thumbnail generation asynchronously so uploading a photo does not have to wait for image processing.

## 4. Where Should Photos Be Stored?

Photos should not be stored directly inside the relational database as large binary objects.

Storing large photos in the database can increase database size, backup and restore times, storage costs, and the load caused by photo downloads.

Instead, store original photos and thumbnails in **object storage**, such as Amazon S3 or an equivalent service. Object storage is designed for large files and can scale to accommodate hundreds of terabytes or more.

The database should store photo metadata, such as the photo ID, owner ID, object-storage key, caption, upload timestamp, and visibility settings. The application can use this metadata to find the correct photo in object storage.

A CDN can cache and deliver the stored images efficiently to users around the world.

## 5. Architecture Diagram

```text
                         +------------------+
                         |      Users       |
                         +------------------+
                                  |
                                  v
                         +------------------+
                         |       CDN        |
                         | Cached images    |
                         +------------------+
                                  |
                                  v
                         +------------------+
                         | Load Balancer    |
                         +------------------+
                                  |
                    +-------------+-------------+
                    |             |             |
                    v             v             v
              +-----------+ +-----------+ +-----------+
              | App       | | App       | | App       |
              | Server 1  | | Server 2  | | Server 3  |
              +-----------+ +-----------+ +-----------+
                    |             |             |
                    +-------------+-------------+
                                  |
                     +------------+------------+
                     |                         |
                     v                         v
              +-------------+           +-------------+
              | Cache       |           | Primary DB  |
              | Feed/data   |           | Metadata    |
              +-------------+           +-------------+
                                              |
                                              v
                                       +-------------+
                                       | Read Replica|
                                       | Read queries|
                                       +-------------+

 Photo upload path:

 App Servers -----> Object Storage
      |
      +-----------> Queue -----------> Thumbnail Worker
                                           |
                                           v
                                    Object Storage
                                    (thumbnails)
```

## 6. Components and the Problems They Solve

1. **CDN:** Delivers cached photos and thumbnails from locations close to users, reducing latency and the load on the application and object storage.
2. **Load balancer:** Distributes incoming requests across healthy application servers to prevent one server from becoming overloaded.
3. **Application servers:** Handle authentication, photo-upload requests, feed generation, permissions, and communication with the cache and database.
4. **Cache:** Stores frequently accessed feed data and metadata in fast memory to reduce repeated database queries and improve response times.
5. **Primary database:** Stores authoritative photo metadata, user information, relationships, captions, and other structured records.
6. **Database read replica:** Handles suitable read queries to reduce the primary database's workload and improve read scalability.
7. **Object storage:** Stores original photos and generated thumbnails as files, allowing image storage to scale independently of the database.
8. **Queue:** Holds thumbnail-generation jobs so that image processing can happen asynchronously and temporary traffic spikes can be absorbed.
9. **Thumbnail worker:** Retrieves queued jobs, creates smaller versions of uploaded photos, and saves the thumbnails to object storage.

## 7. Step-by-Step Photo Upload Flow

1. The user selects a photo and submits it through the SnapShare application.
2. The load balancer routes the upload request to a healthy application server.
3. The application server authenticates the user, checks upload permissions, validates the file type and size, and rejects invalid uploads.
4. The application assigns a unique photo ID and stores the original image in object storage.
5. After the original image is stored successfully, the application records its metadata in the primary database, including the owner, object-storage key, and upload timestamp.
6. The application places a thumbnail-generation job on the queue with the photo ID and the original object's storage key.
7. The application responds to the user that the upload has been accepted, without waiting for thumbnail generation to finish.
8. A thumbnail worker retrieves the job from the queue and reads the original image from object storage.
9. The worker generates a smaller thumbnail and uploads it to object storage under a separate key.
10. The worker updates the photo metadata or thumbnail status in the primary database, if required.
11. The application can now return the photo and its thumbnail in feed results; the CDN can cache the thumbnail and deliver it efficiently to viewers.

The queue and worker allow thumbnail processing to be retried if a temporary failure occurs. The system should track job failures and ensure that retries do not create duplicate or inconsistent results.

## 8. Trade-Offs

### Trade-off 1: Object storage versus database storage

**Benefit:** Object storage scales well for large files and keeps the database smaller and more efficient.

**Cost:** The application must manage storage keys, permissions, file deletion, and coordination between the database and object storage. A failed upload or metadata write may leave an orphaned object unless cleanup is implemented.

### Trade-off 2: Caching versus data freshness

**Benefit:** Caching reduces database load and improves feed response times, especially for popular content.

**Cost:** Cached feeds and metadata may become stale after a user uploads a photo, deletes a post, or changes privacy settings. Cache invalidation and appropriate expiration policies are necessary.

### Trade-off 3: Asynchronous thumbnail generation versus immediate availability

**Benefit:** A queue lets uploads finish without waiting for thumbnail processing and helps the system absorb bursts of uploads.

**Cost:** Thumbnails may not be available immediately. The application needs a placeholder or fallback image, job retries, and monitoring for failed jobs.

### Trade-off 4: Database read replica versus consistency

**Benefit:** A read replica distributes read traffic and reduces pressure on the primary database.

**Cost:** Replication may lag behind the primary database. A newly uploaded photo might not immediately appear in a feed queried through the replica. The application can use the primary database for critical read-after-write requests or apply other consistency strategies.

## 9. Conclusion

SnapShare should use a horizontally scalable application tier, a CDN, caching, a primary database with a read replica, object storage, and a queue-based thumbnail-processing system.

With one million daily active users, the estimated workload is approximately 11.57 photo uploads per second on average and 578.70 feed views per second on average, with peak feed traffic of about 2,894 requests per second.

The application requires approximately 748.25 TB of new original-photo and thumbnail storage per year under the stated assumptions. Capacity planning should also account for backups, replication, monitoring, and future growth.
