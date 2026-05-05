const Listing = require("../models/listing.js");
const User = require("../models/user.js"); // adjust path as needed
const {listingSchema } = require("../schema.js");



module.exports.index = async(req, res) => {
   const { category, search } = req.query;  // grabs ?category=mountains from the URL
   let filter = {};
    if (category) {
        filter.category = category;         // adds category filter to the query if category is specified
    }

    if (search) {                           // adds search filter to the query if search term is specified

        const matchingUsers = await User.find({ username: { $regex: search, $options: "i" } });
        const userIds = matchingUsers.map(u => u._id);

        filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { country: { $regex: search, $options: "i" } },
        { owner:    { $in: userIds } },
        ];
    }
  const allListings = await Listing.find(filter);
  let noResults = allListings.length === 0 && (search || category);
  res.render("listings/index", { allListings, activeCategory: category || "",searchQuery: search || "", noResults });
};

module.exports.new = (req, res) => {
    res.render("listings/new");
}

module.exports.show = async(req, res) => {
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({ path:"reviews", populate: { path: "author" }}).populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested  for was not found!");
        return res.redirect("/listings");
    }
    //console.log(listing);
    res.render("listings/show", {listing});
}

module.exports.create = async (req, res) =>{
    let url = req.file.path;
    let filename = req.file.filename;
    const newListing= new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    // console.log(newListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
    // console.log(req.body);
}

module.exports.edit = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested  for was not found!");
        return res.redirect("/listings");
    }
    OrignalImageUrl = listing.image.url;
    OrignalImageUrl = OrignalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", {listing, OrignalImageUrl});
}

module.exports.update = async (req,res) => {
    let {id} = req.params;
    // let {listing:upDatelisting} = req.body.listing;
    const upDatedlisting = await Listing.findByIdAndUpdate(id,
        {...req.body.listing},
        {runValidators: true, new: true });
    if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    upDatedlisting.image = {url, filename};
    await upDatedlisting.save();
    }
    console.log(upDatedlisting);
    req.flash("success", "Listing Updated!");
   res.redirect(`/listings/${id}`);
}

module.exports.delete = async (req,res) => {
    let {id} = req.params;
  let deletedlisting =  await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}