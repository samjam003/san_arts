const home = async (req, res) => {
  const testimonials = [
    {
      name: "Sarah Williams",
      location: "New York, USA",
      // External image URL from Unsplash
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
      rating: 5,
      text: "The portrait captured my daughter's personality perfectly. Every time I look at it, I see something new. Truly an extraordinary talent!",
      // External artwork image
      artwork:
        "https://images.unsplash.com/photo-1574182245530-967d9b3831af?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Michael Chen",
      location: "Toronto, Canada",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
      rating: 5,
      text: "I commissioned a piece for our anniversary, and it exceeded all expectations. The attention to detail and emotional depth is remarkable.",
      artwork:
        "https://images.unsplash.com/photo-1574182245530-967d9b3831af?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      name: "Elena Rodriguez",
      location: "Barcelona, Spain",
      image:
        "https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&q=80",
      rating: 5,
      text: "Working with this artist was a wonderful experience from start to finish. They listened carefully to my vision and brought it to life beautifully.",
      artwork:
        "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
  ];

  // Optional: Fetch services, FAQs, and contact info from database
  const services = [
    { id: "portrait", name: "Portrait Commission" },
    { id: "landscape", name: "Landscape Artwork" },
    { id: "abstract", name: "Abstract Piece" },
    { id: "illustration", name: "Custom Illustration" },
  ];

  // Contact information
  const contactInfo = {
    contactEmail: "artist@example.com",
    contactPhone: "+1 (555) 123-4567",
    studioAddress: "Art District, 123 Creative Lane, New York, NY 10001",
    studioImage:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    social: {
      instagram: "https://instagram.com/artistname",
      facebook: "https://facebook.com/artistname",
      twitter: "https://twitter.com/artistname",
      pinterest: "https://pinterest.com/artistname",
    },
  };

  const faqItems = [
    {
      question: "How long does a commission typically take?",
      answer:
        "The timeline varies depending on project complexity and my current workload. Small pieces generally take 2-3 weeks, while larger or more detailed commissions may take 4-8 weeks. I'll provide a specific timeline estimate when discussing your project.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes! I ship artwork worldwide using insured and tracked shipping services. International shipping costs will be calculated based on your location and the size/weight of the artwork.",
    },
    {
      question:
        "What information should I include when requesting a commission?",
      answer:
        "Please share your vision, desired size, color palette preferences, intended display location, and timeline needs. Reference images are also very helpful! The more details you provide, the better I can bring your vision to life.",
    },
  ];
  res.render("gallery", {
    title: "San Arts",
    testimonials,
    services: services,
    faqItems: faqItems,
    ...contactInfo,
  });
};

const updateImage = async (req, res) => {
  const { id } = req.params;
  const { img_title, description, main_category_id, subcategory_id, filterValues } = req.body;
  const img_url = req.file ? req.file.path : undefined;

  try {
    // Start a transaction
    const { data: imageData, error: imageError } = await supabase
      .from("art_images")
      .update({
        img_title,
        description,
        main_category_id,
        subcategory_id,
        ...(img_url && { img_url })
      })
      .eq("id", id)
      .select()
      .single();

    if (imageError) {
      return res.status(500).json({ message: "Error updating image", error: imageError.message });
    }

    // Delete existing filter values
    const { error: deleteError } = await supabase
      .from("filter_value")
      .delete()
      .eq("img_id", id);

    if (deleteError) {
      return res.status(500).json({ message: "Error deleting existing filter values", error: deleteError.message });
    }

    // Insert new filter values if provided
    if (filterValues && filterValues.length > 0) {
      const filterInsertData = filterValues.map(item => ({
        img_id: id,
        filter_id: item.filter_id,
        value: item.value,
        subcategory_id
      }));

      const { error: filterError } = await supabase
        .from("filter_value")
        .insert(filterInsertData);

      if (filterError) {
        return res.status(500).json({ message: "Error inserting filter values", error: filterError.message });
      }
    }

    res.status(200).json(imageData);
  } catch (err) {
    res.status(500).json({ message: "Unexpected error occurred", error: err.message });
  }
};

const deleteImage = async (req, res) => {
  const { id } = req.params;

  try {
    // Delete filter values first
    const { error: filterError } = await supabase
      .from("filter_value")
      .delete()
      .eq("img_id", id);

    if (filterError) {
      return res.status(500).json({ message: "Error deleting filter values", error: filterError.message });
    }

    // Delete the image
    const { error: imageError } = await supabase
      .from("art_images")
      .delete()
      .eq("id", id);

    if (imageError) {
      return res.status(500).json({ message: "Error deleting image", error: imageError.message });
    }

    res.status(200).json({ message: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Unexpected error occurred", error: err.message });
  }
};

const addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const {
      img_title,
      description,
      main_category_id,
      subcategory_id,
      filterValues,
    } = req.body;

    // Insert the image into art_images table
    const { data: insertedImage, error: insertImageError } = await supabase
      .from("art_images")
      .insert([
        {
          img_title,
          img_url: req.file.path,
          description,
          main_category_id,
          subcategory_id,
        },
      ])
      .select()
      .single();

    if (insertImageError) {
      console.error("Error inserting image:", insertImageError);
      return res.status(500).json({
        success: false,
        message: "Failed to insert image data",
      });
    }

    // Parse filter values if provided
    let parsedFilterValues = filterValues;
    if (typeof filterValues === "string") {
      try {
        parsedFilterValues = JSON.parse(filterValues);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid filterValues JSON format",
        });
      }
    }

    // Insert filter values if provided
    if (Array.isArray(parsedFilterValues) && parsedFilterValues.length > 0) {
      const filterInsertData = parsedFilterValues.map(item => ({
        img_id: insertedImage.id,
        filter_id: item.filter_id,
        value: item.value,
        subcategory_id
      }));

      const { error: filterError } = await supabase
        .from("filter_value")
        .insert(filterInsertData);

      if (filterError) {
        console.error("Error inserting filter values:", filterError);
        return res.status(500).json({
          success: false,
          message: "Image inserted but failed to insert filter values",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: insertedImage,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error uploading image",
      error: error.message,
    });
  }
};

module.exports = { home, updateImage, deleteImage, addImage };
