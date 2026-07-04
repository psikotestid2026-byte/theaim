import re

file = "Rooting/mockup_layanan_assessment.html"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# The current broken structure is:
# Card 2 ends with:
#                             </a>
#                         </div>
#                     </div>
#                 </div>
#
# <!-- 3. Assessment + Coach Alif -->
# ...
#                             </a>
#                         </div>
#                     </div>
#                 </div>
#             </div>
#
#             <!-- Separator -->

# We need to remove the "</div>" that closes the grid before Card 3, 
# and ensure Card 3 ends with the proper closures.

# Let's just fix it precisely.
# Card 2 ends with:
c2_end = """                            </a>
                        </div>
                    </div>
                </div>

<!-- 3. Assessment + Coach Alif -->"""

# We replace that with just TWO divs. The third div was closing the grid.
fixed_c2_end = """                            </a>
                        </div>
                    </div>

                    <!-- 3. Assessment + Coach Alif -->"""

content = content.replace(c2_end, fixed_c2_end)

# Now check the end of Card 3.
# It should end with:
#                             </a>
#                         </div>
#                     </div>
#                 </div>
#             </div>
#
# But wait, earlier there was a <div class="mb-16"> wrapping the grid, and before that a <div class="max-w-[1200px]">.
# Let's count the open/close divs.
# <section id="pricing"> (not a div)
#   <div class="max-w-[1200px]">
#     <div class="mb-16">
#       <div class="grid">
#         Card 1
#         Card 2
#         Card 3
#       </div>
#     </div>

# So after Card 3, we need to close the grid, close the mb-16 div. (2 divs)
# Let's see what is after Card 3 right now:
#                             </a>
#                         </div>
#                     </div>
#                 </div>
#             </div>
# 
#             <!-- Separator -->

c3_end_current = """                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Separator -->"""

c3_end_fixed = """                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Separator -->"""
# Actually, the 3rd card currently ends with:
# </div> </div> </div> </div>
# Wait, let's look at the view_file output:
# 504:                                 Daftar Sekarang
# 505:                             </a>
# 506:                         </div>
# 507:                     </div>
# 508:                 </div>
# 509:             </div>
# 510: 
# 511:             <!-- Separator -->

# The div closing count:
# Card 3 content ends -> </a>
# 506: </div> (closes p-8)
# 507: </div> (closes bg-white card)
# 508: </div> (closes grid)
# 509: </div> (closes mb-16)
# That's perfectly correct!

with open(file, "w", encoding="utf-8") as f:
    f.write(content)
print("Layout fixed")
