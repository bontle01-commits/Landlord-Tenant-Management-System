import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function createListing(req, res) {
  const { title, description, price, location } = req.body;

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      location,
      imageUrl: req.file?.path,
      ownerId: req.userId
    }
  });

  res.json(listing);
}

export async function getListings(req, res) {
  const listings = await prisma.listing.findMany({
    include: { owner: true }
  });

  res.json(listings);
}